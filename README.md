# FusionDB

**Everything your app needs. Fused.**

FusionDB is an AI-native backend and data platform designed to unify database,
backend infrastructure, security, analytics, operations, and AI-agent workflows.

## Current Stage

**V0.1 Foundation / Milestone M001**

Current goal:

```text
Account
  -> Organization
  -> Create Project
  -> PostgreSQL Provisioned
  -> Credentials Generated
  -> External Node.js Connection
  -> First Successful Query
```

## Start Here

Read these documents in order:

1. `docs/00-PRODUCT.md`
2. `docs/01-MVP.md`
3. `docs/02-ARCHITECTURE.md`

## Repository Areas

- `apps/console` — FusionDB web console
- `apps/api` — control-plane API
- `services/gateway` — public Fusion Gateway
- `services/provisioner` — project database lifecycle
- `services/data-api` — internal Data API orchestration
- `packages/sdk-js` — future `@fusiondb/sdk`
- `packages/database` — control-plane metadata schema/access
- `packages/auth` — shared management authentication
- `packages/contracts` — shared API schemas and types
- `packages/security` — authorization/policy helpers
- `packages/config` — shared configuration
- `packages/ui` — shared UI primitives
- `packages/observability` — logging and telemetry helpers
- `infrastructure` — local/container infrastructure

## Rules

1. V0.1 scope is frozen in `docs/01-MVP.md`.
2. New feature ideas go to a later roadmap unless required for M001-M005.
3. No customer-facing database superuser credentials.
4. Control-plane metadata and project data remain logically separated.
5. AI/MCP features begin after V0.1 core is working.
6. Do not commit secrets.

## Next Implementation Step

Initialize the toolchain and build Milestone M001:

1. pnpm workspace + Turborepo
2. Next.js console
3. Fastify API
4. PostgreSQL control-plane database
5. Organization/project schema
6. Project provisioning job
7. Project PostgreSQL creation
8. Generated credentials
9. External Node.js connection test

## Local Bootstrap (M001-A)

The initial toolchain is pinned to Node.js 24 and pnpm 11.4.0.

```bash
npm install --global pnpm@11.4.0
pnpm install
cp .env.example .env
pnpm db:up
pnpm dev
```

- Console: `http://localhost:3000`
- Control API: `http://localhost:4000`
- API health: `http://localhost:4000/health`

See `docs/03-M001-RUNBOOK.md` for verification and the next implementation step.

## M001 Implementation Status

- Bootstrap: implemented
- Control Plane metadata: implemented
- Better Auth management identity: implemented
- PostgreSQL project provisioner: implemented
- Encrypted connection credentials: implemented
- Cross-project isolation E2E: implemented in GitHub Actions

See `docs/04-M001-CONTROL-PLANE.md`.
