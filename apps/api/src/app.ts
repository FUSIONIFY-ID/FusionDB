import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authPool } from '@fusiondb/auth';
import { controlPool, pingControlDatabase } from '@fusiondb/database';
import { pingProjectDatabaseAdmin } from '@fusiondb/provisioner';
import { loadEnv } from './env.js';
import { registerAuthRoutes } from './auth-routes.js';
import { getSession } from './session.js';
import { createOrganization, createProjectMetadata, getOrganizationRole, getProjectConnection, getProjectForUser, listOrganizations, listProjects, runProvisionJob } from './control.js';

export type BuildAppOptions = { logger?: boolean };

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const env = loadEnv();
  const app = Fastify({ logger: options.logger ?? true, requestIdHeader: 'x-request-id', requestIdLogLabel: 'requestId', bodyLimit: 1024 * 1024 });
  await app.register(helmet, { global: true });
  await app.register(cors, { origin: env.FUSION_CONSOLE_URL, credentials: true, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] });
  await registerAuthRoutes(app);

  app.get('/health', async () => ({ status: 'ok', service: 'fusiondb-control-api', version: '0.1.0-m001' }));
  app.get('/ready', async (_request, reply) => {
    const checks: Record<string,string> = { process: 'ok' };
    try { await pingControlDatabase(); checks.controlDatabase = 'ok'; } catch { checks.controlDatabase = 'failed'; }
    try { await pingProjectDatabaseAdmin(env.PROJECT_DB_ADMIN_URL); checks.projectDatabase = 'ok'; } catch { checks.projectDatabase = 'failed'; }
    const ready = Object.values(checks).every((value) => value === 'ok');
    return reply.code(ready ? 200 : 503).send({ status: ready ? 'ready' : 'degraded', checks });
  });
  app.get('/v1/system/info', async () => ({ product: 'FusionDB', milestone: 'M001', stage: 'control-plane-and-provisioner' }));

  app.get('/v1/me', async (request, reply) => {
    const session = await getSession(request);
    if (!session) return reply.code(401).send({ error: 'unauthorized' });
    return { user: session.user, session: { expiresAt: session.session.expiresAt } };
  });

  const orgBody = z.object({ name: z.string().trim().min(2).max(80) });
  app.post('/v1/organizations', async (request, reply) => {
    const session = await getSession(request); if (!session) return reply.code(401).send({ error: 'unauthorized' });
    const parsed = orgBody.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error: 'invalid_request', details: parsed.error.flatten() });
    const organization = await createOrganization(session.user.id, parsed.data.name);
    return reply.code(201).send({ organization });
  });
  app.get('/v1/organizations', async (request, reply) => {
    const session = await getSession(request); if (!session) return reply.code(401).send({ error: 'unauthorized' });
    return { organizations: await listOrganizations(session.user.id) };
  });

  const projectBody = z.object({ organizationId: z.string().min(5), name: z.string().trim().min(2).max(100), region: z.string().trim().min(2).max(40).default('local') });
  app.post('/v1/projects', async (request, reply) => {
    const session = await getSession(request); if (!session) return reply.code(401).send({ error: 'unauthorized' });
    const parsed = projectBody.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error: 'invalid_request', details: parsed.error.flatten() });
    const role = await getOrganizationRole(session.user.id, parsed.data.organizationId);
    if (!role || !['owner','admin'].includes(role)) return reply.code(403).send({ error: 'forbidden' });
    const created = await createProjectMetadata(session.user.id, parsed.data.organizationId, parsed.data.name, parsed.data.region);
    void runProvisionJob(created.jobId, created.projectId, parsed.data.organizationId, session.user.id, env).catch((error) => app.log.error({ error, projectId: created.projectId }, 'unhandled provisioning failure'));
    return reply.code(202).send({ project: { id: created.projectId, name: parsed.data.name, status: 'provisioning' }, jobId: created.jobId });
  });
  app.get('/v1/projects', async (request, reply) => {
    const session = await getSession(request); if (!session) return reply.code(401).send({ error: 'unauthorized' });
    return { projects: await listProjects(session.user.id) };
  });
  app.get<{ Params: { projectId: string } }>('/v1/projects/:projectId', async (request, reply) => {
    const session = await getSession(request); if (!session) return reply.code(401).send({ error: 'unauthorized' });
    const project = await getProjectForUser(session.user.id, request.params.projectId);
    if (!project) return reply.code(404).send({ error: 'not_found' });
    return { project };
  });
  app.get<{ Params: { projectId: string } }>('/v1/projects/:projectId/connection', async (request, reply) => {
    const session = await getSession(request); if (!session) return reply.code(401).send({ error: 'unauthorized' });
    const project = await getProjectForUser(session.user.id, request.params.projectId);
    if (!project) return reply.code(404).send({ error: 'not_found' });
    const role = await getOrganizationRole(session.user.id, project.organizationId);
    if (!role || !['owner','admin'].includes(role)) return reply.code(403).send({ error: 'forbidden' });
    const connection = await getProjectConnection(session.user.id, request.params.projectId, env.FUSION_MASTER_KEY_B64);
    if (!connection) return reply.code(409).send({ error: 'project_not_ready' });
    reply.header('cache-control', 'no-store');
    return { connection };
  });

  app.addHook('onClose', async () => {
    await Promise.allSettled([controlPool.end(), authPool.end()]);
  });
  return app;
}
