import { and, desc, eq } from 'drizzle-orm';
import { db, organizationMembers, organizations, projects, environments, provisionJobs, projectCredentials, auditEvents } from '@fusiondb/database';
import { decryptSecret, encryptSecret } from '@fusiondb/security';
import { provisionProjectDatabase } from '@fusiondb/provisioner';
import type { ApiEnv } from './env.js';
import { makeId, slugify } from './id.js';

export async function createOrganization(userId: string, name: string) {
  const id = makeId('org');
  let slug = slugify(name);
  const collision = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug)).limit(1);
  if (collision.length) slug = `${slug}-${id.slice(-6).toLowerCase()}`;
  await db.transaction(async (tx) => {
    await tx.insert(organizations).values({ id, name, slug, createdBy: userId });
    await tx.insert(organizationMembers).values({ organizationId: id, userId, role: 'owner' });
    await tx.insert(auditEvents).values({ id: makeId('aud'), actorId: userId, organizationId: id, action: 'organization.created', resourceType: 'organization', resourceId: id, metadata: { name } });
  });
  return { id, name, slug, role: 'owner' as const };
}

export async function listOrganizations(userId: string) {
  return db.select({ id: organizations.id, name: organizations.name, slug: organizations.slug, role: organizationMembers.role })
    .from(organizationMembers).innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));
}

export async function getOrganizationRole(userId: string, organizationId: string): Promise<string | null> {
  const rows = await db.select({ role: organizationMembers.role }).from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId))).limit(1);
  return rows[0]?.role ?? null;
}

export async function createProjectMetadata(userId: string, organizationId: string, name: string, region: string) {
  const projectId = makeId('prj');
  const environmentId = makeId('env');
  const jobId = makeId('job');
  await db.transaction(async (tx) => {
    await tx.insert(projects).values({ id: projectId, organizationId, name, region, status: 'provisioning', createdBy: userId });
    await tx.insert(environments).values({ id: environmentId, projectId, name: 'production', kind: 'production', status: 'provisioning' });
    await tx.insert(provisionJobs).values({ id: jobId, projectId, status: 'queued' });
    await tx.insert(auditEvents).values({ id: makeId('aud'), actorId: userId, organizationId, projectId, action: 'project.created', resourceType: 'project', resourceId: projectId, metadata: { name, region } });
  });
  return { projectId, environmentId, jobId };
}

export async function listProjects(userId: string) {
  return db.select({ id: projects.id, organizationId: projects.organizationId, name: projects.name, region: projects.region, status: projects.status, databaseName: projects.databaseName, createdAt: projects.createdAt })
    .from(projects).innerJoin(organizationMembers, eq(projects.organizationId, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectForUser(userId: string, projectId: string) {
  const rows = await db.select({ id: projects.id, organizationId: projects.organizationId, name: projects.name, region: projects.region, status: projects.status, databaseName: projects.databaseName, createdAt: projects.createdAt })
    .from(projects).innerJoin(organizationMembers, eq(projects.organizationId, organizationMembers.organizationId))
    .where(and(eq(projects.id, projectId), eq(organizationMembers.userId, userId))).limit(1);
  return rows[0] ?? null;
}

export async function runProvisionJob(jobId: string, projectId: string, organizationId: string, actorId: string, env: ApiEnv): Promise<void> {
  try {
    await db.update(provisionJobs).set({ status: 'running', attempt: 1, startedAt: new Date(), error: null }).where(eq(provisionJobs.id, jobId));
    const result = await provisionProjectDatabase({ projectId, adminUrl: env.PROJECT_DB_ADMIN_URL, publicHost: env.PROJECT_DB_PUBLIC_HOST, publicPort: env.PROJECT_DB_PUBLIC_PORT });
    const encrypted = encryptSecret(result.password, env.FUSION_MASTER_KEY_B64);
    await db.transaction(async (tx) => {
      await tx.insert(projectCredentials).values({ projectId, databaseName: result.databaseName, roleName: result.roleName, host: env.PROJECT_DB_PUBLIC_HOST, port: env.PROJECT_DB_PUBLIC_PORT, secretCiphertext: encrypted });
      await tx.update(projects).set({ status: 'ready', databaseName: result.databaseName, updatedAt: new Date() }).where(eq(projects.id, projectId));
      await tx.update(environments).set({ status: 'ready' }).where(and(eq(environments.projectId, projectId), eq(environments.name, 'production')));
      await tx.update(provisionJobs).set({ status: 'succeeded', finishedAt: new Date() }).where(eq(provisionJobs.id, jobId));
      await tx.insert(auditEvents).values({ id: makeId('aud'), actorId, organizationId, projectId, action: 'project.provisioned', resourceType: 'database', resourceId: result.databaseName, metadata: { roleName: result.roleName } });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown provisioning error';
    await db.transaction(async (tx) => {
      await tx.update(projects).set({ status: 'failed', updatedAt: new Date() }).where(eq(projects.id, projectId));
      await tx.update(environments).set({ status: 'failed' }).where(and(eq(environments.projectId, projectId), eq(environments.name, 'production')));
      await tx.update(provisionJobs).set({ status: 'failed', error: message.slice(0, 2000), finishedAt: new Date() }).where(eq(provisionJobs.id, jobId));
      await tx.insert(auditEvents).values({ id: makeId('aud'), actorId, organizationId, projectId, action: 'project.provision_failed', resourceType: 'database', resourceId: projectId, metadata: { error: message.slice(0, 500) } });
    });
  }
}

export async function getProjectConnection(userId: string, projectId: string, masterKey: string) {
  const project = await getProjectForUser(userId, projectId);
  if (!project || project.status !== 'ready') return null;
  const rows = await db.select().from(projectCredentials).where(eq(projectCredentials.projectId, projectId)).limit(1);
  const credential = rows[0];
  if (!credential) return null;
  const password = decryptSecret(credential.secretCiphertext, masterKey);
  const url = new URL('postgresql://localhost');
  url.username = credential.roleName; url.password = password; url.hostname = credential.host; url.port = String(credential.port); url.pathname = `/${credential.databaseName}`;
  return { url: url.toString(), host: credential.host, port: credential.port, database: credential.databaseName, user: credential.roleName };
}
