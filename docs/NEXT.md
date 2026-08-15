# Next Action

Do not add product features yet.

## Immediate task

Initialize the actual toolchain and complete **Milestone M001**.

### Toolchain

- Pin Node.js version
- Pin pnpm version
- Install Turborepo
- Initialize Next.js in `apps/console`
- Initialize Fastify in `apps/api`
- Add Drizzle + PostgreSQL control-plane schema
- Add Better Auth management authentication
- Add Docker Compose for local PostgreSQL services

### First vertical slice

```text
Sign Up
-> Create Organization
-> Create Project
-> Provision PostgreSQL DB
-> Generate Restricted Credential
-> Connect from External Node.js
-> Verify Cross-Project Isolation
```

No MCP, ClickHouse, analytics, storage, or AI agent code until this slice works.
