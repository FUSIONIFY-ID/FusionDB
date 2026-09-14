# M001 Runbook

**Current substage:** M001-A Bootstrap

## Goal

Create a reproducible local foundation before implementing FusionDB provisioning logic.

## Toolchain

- Node.js 24 LTS
- pnpm 11.4.0
- Turborepo 2.10.6
- Next.js 16.2.9
- React 19.2.8
- Fastify 5.10.0
- TypeScript 6.0.3
- PostgreSQL 18.4

## Bootstrap

```bash
# Use Node 24 with your Node version manager first.
npm install --global pnpm@11.4.0

pnpm --version
node --version
pnpm install
cp .env.example .env
pnpm db:up
pnpm dev
```

Expected local endpoints:

- Console: `http://localhost:3000`
- Control API: `http://localhost:4000`
- Health: `http://localhost:4000/health`
- Control PostgreSQL: `localhost:5432`
- Project PostgreSQL infrastructure: `localhost:5433`

## Verification

```bash
pnpm check:toolchain
pnpm typecheck
pnpm test
pnpm build
```

API check:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "fusiondb-control-api",
  "version": "0.0.0"
}
```

## M001-A Done When

- Node and pnpm versions are pinned.
- Workspace dependencies install successfully.
- Console starts on port 3000.
- API starts on port 4000.
- `/health` passes.
- Control and project PostgreSQL services become healthy.
- `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.

## Next: M001-B

Do not start MCP, AI, analytics, or the public Data API yet.

M001-B will add:

1. Drizzle control-plane database package.
2. Better Auth management authentication.
3. `users`, `organizations`, `organization_members`, `projects`, `environments`, and `provision_jobs` metadata.
4. First authenticated `POST /v1/projects` contract.
5. Provisioning job state machine skeleton.
