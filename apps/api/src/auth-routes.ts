import { auth } from '@fusiondb/auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const origin = process.env.BETTER_AUTH_URL ?? 'http://localhost:4000';
      const url = new URL(request.url, origin);
      const headers = fromNodeHeaders(request.headers);
      const body = request.body && request.method !== 'GET' && request.method !== 'HEAD'
        ? JSON.stringify(request.body)
        : undefined;
      const response = await auth.handler(new Request(url, { method: request.method, headers, ...(body ? { body } : {}) }));
      reply.code(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') reply.header(key, value);
      });
      const setCookies = response.headers.getSetCookie?.() ?? [];
      if (setCookies.length) reply.header('set-cookie', setCookies);
      const buffer = Buffer.from(await response.arrayBuffer());
      return reply.send(buffer);
    },
  });
}
