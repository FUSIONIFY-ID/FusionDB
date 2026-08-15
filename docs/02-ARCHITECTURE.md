# FusionDB V0.1 Architecture

**Document:** `02-ARCHITECTURE.md`  
**Status:** Baseline Architecture v0.1  
**Date:** 2026-08-15

---

## 1. Architecture Goal

Build the smallest architecture that can prove FusionDB's core workflow while preserving boundaries required for later AI, analytics, security, and multi-region expansion.

The architecture must avoid two extremes:

1. A disposable demo that must be rewritten immediately.
2. Premature distributed-system complexity before product-market proof.

---

## 2. Architecture Principles

### 2.1 TypeScript-first Control Plane

FusionDB's initial developer-facing software stack should use TypeScript wherever it improves iteration speed and shared types.

### 2.2 PostgreSQL-native Core

FusionDB V0.1 uses PostgreSQL for:

- Control-plane metadata
- Project transactional databases
- Application data

Control-plane metadata and customer project data must remain logically separate.

### 2.3 Gateway Before Internal Services

External applications interact with stable FusionDB endpoints.

Internal service topology should not become a customer contract.

### 2.4 No Direct Internal Data API Exposure

If PostgREST is used internally, it sits behind Fusion Gateway.

### 2.5 Authorization at Multiple Layers

Gateway authorization does not replace database authorization.

### 2.6 Explicit Tenant Context

Every management request must resolve:

```text
actor_id
organization_id
project_id
environment_id
permissions
```

before executing a project-scoped operation.

### 2.7 Async Provisioning

Creating or deleting infrastructure should be represented as jobs with explicit status, retries, and rollback/cleanup behavior.

### 2.8 V0.1 Is Modular, Not Microservice-Maximal

Services may start in a small deployment footprint while retaining domain boundaries in code.

Split deployment units only when operationally justified.

---

## 3. Frozen Baseline Stack

### Monorepo

- pnpm workspaces
- Turborepo

### Console

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture

### Control Plane API

- Node.js
- TypeScript
- Fastify
- Zod/JSON Schema validation
- OpenAPI generation

### Control Plane Authentication

- Better Auth as the initial TypeScript authentication framework
- PostgreSQL-backed sessions/users
- Architecture must not couple project application auth permanently to control-plane auth

### Control Plane Data Access

- Drizzle ORM for FusionDB-owned metadata
- Raw parameterized SQL remains allowed for infrastructure-specific operations where appropriate

### Core Database

- PostgreSQL

### Automatic REST Data API

- PostgREST internally
- Fusion Gateway externally

### Local Infrastructure

- Docker
- Docker Compose

### Observability Baseline

- Structured JSON logs
- Request IDs
- Correlation IDs
- Health/readiness endpoints

OpenTelemetry integration is planned as the observability model matures.

---

## 4. High-Level System

```text
                         INTERNET
                            |
                            v
                   +------------------+
                   |   Fusion Edge    |
                   | TLS / WAF later  |
                   +--------+---------+
                            |
                            v
                   +------------------+
                   | Fusion Gateway   |
                   | API + policies   |
                   +----+--------+----+
                        |        |
          Management API|        |Data API
                        |        |
                        v        v
              +-------------+  +-------------+
              | Control     |  | PostgREST   |
              | Plane API   |  | Internal    |
              +------+------+  +------+------+
                     |                |
                     |                |
                     v                v
          +------------------+   +------------------+
          | Control Metadata |   | Project Database |
          | PostgreSQL       |   | PostgreSQL       |
          +------------------+   +------------------+
                     |
                     v
              +-------------+
              | Provisioner |
              +------+------+
                     |
                     v
             Project DB / Role
             lifecycle operations
```

---

## 5. Monorepo Target

After foundation docs are frozen, initialize:

```text
fusiondb/
|
+-- apps/
|   +-- console/             # FusionDB web console
|   +-- api/                 # Control Plane API
|   +-- docs/                # Developer docs, later
|
+-- services/
|   +-- gateway/             # Public API gateway
|   +-- provisioner/         # Project DB lifecycle
|   +-- data-api/            # PostgREST config/orchestration
|
+-- packages/
|   +-- sdk-js/              # @fusiondb/sdk
|   +-- database/            # Control-plane DB schema/access
|   +-- auth/                # Shared control-plane auth config
|   +-- contracts/           # API schemas/types
|   +-- security/            # Authorization helpers/policies
|   +-- config/              # Shared config
|   +-- ui/                  # Shared UI components
|   +-- observability/       # Logging/telemetry helpers
|
+-- infrastructure/
|   +-- docker/
|   +-- local/
|   +-- migrations/
|
+-- docs/
|   +-- 00-PRODUCT.md
|   +-- 01-MVP.md
|   +-- 02-ARCHITECTURE.md
|
+-- package.json
+-- pnpm-workspace.yaml
+-- turbo.json
+-- .env.example
+-- .gitignore
```

Do not create empty services merely to look enterprise. A directory becomes active when its milestone requires it.

---

## 6. Core Domain Model

Minimum control-plane entities:

```text
User
  |
  v
Organization
  |
  v
OrganizationMember
  |
  v
Project
  |
  v
Environment
  |
  v
DatabaseResource
```

Additional infrastructure entities:

```text
ProjectCredential
APIKey
ProvisionJob
AuditEvent
QueryHistory
```

Recommended identifier prefixes:

```text
usr_
org_
prj_
env_
db_
key_
job_
aud_
```

IDs must be non-sequential opaque identifiers externally.

---

## 7. Control Plane vs Data Plane

### Control Plane

Responsible for:

- User accounts
- Organizations
- Projects
- Memberships
- Project configuration
- Provisioning state
- API keys
- Usage metadata
- Audit metadata
- Future billing metadata

### Data Plane

Responsible for customer application traffic and customer data.

Includes:

- Project PostgreSQL
- Data API
- Future storage
- Future functions
- Future realtime
- Future analytics

These planes may share infrastructure during local development but must retain explicit logical boundaries.

---

## 8. Project Provisioning Flow

### Request

```http
POST /v1/projects
```

### Workflow

```text
Authenticated User
      |
      v
Authorization Check
      |
      v
Create Project Metadata
status = provisioning
      |
      v
Create Provision Job
      |
      v
Provisioner
      |
      +-- create project database
      +-- create owner/internal roles
      +-- create application role
      +-- create exposed schema
      +-- apply baseline extensions/policies
      +-- generate credentials
      +-- configure data API
      |
      v
Health Check
      |
      +-- fail -> cleanup / failed
      |
      v
Project status = ready
```

The API must not hold a single HTTP request open while performing all future infrastructure provisioning.

---

## 9. V0.1 Isolation Model

Initial alpha may use shared PostgreSQL server infrastructure.

Each project receives:

```text
PostgreSQL instance/cluster
  |
  +-- project_database_A
  |      +-- project-specific roles
  |
  +-- project_database_B
         +-- project-specific roles
```

Minimum requirements:

- Project application role cannot connect to another project database.
- No application role is superuser.
- Management credentials are never returned to customer applications.
- Provisioner credentials are isolated from normal gateway credentials.
- Control-plane DB credentials cannot be reused as project DB credentials.
- Project deletion follows explicit lifecycle and audit procedures.

Later tiers may introduce:

- database-per-project on dedicated compute
- cluster-per-project
- organization-isolated infrastructure
- BYOC

---

## 10. PostgreSQL Roles

Conceptual roles:

### `fusion_internal_admin`

Used only by tightly controlled provisioning/internal automation.

Never exposed.

### `fusion_project_owner_<id>`

Owns project-level database objects where necessary.

Not exposed to browsers.

### `fusion_service_<id>`

Used by Fusion Data API with policy-aware execution.

### `fusion_direct_<id>`

Optional direct connection role for server-side application use.

Privileges should be least-privilege and documented.

Role naming may change before implementation.

---

## 11. Fusion Gateway

The Gateway is a critical future security boundary.

V0.1 responsibilities:

- Resolve project
- Validate API key/token
- Resolve actor/context
- Attach request ID
- Enforce rate limits
- Enforce request size
- Normalize errors
- Log request metadata
- Route Data API traffic
- Route management API traffic as appropriate

Future responsibilities:

- Bot protection
- advanced policy engine
- agent identity
- cost-aware rate limits
- workload routing
- DLP
- egress policy
- analytics routing

---

## 12. Data API

Internal V0.1 flow:

```text
Application
    |
    v
Fusion Gateway
    |
    v
Auth / Project Context
    |
    v
PostgREST
    |
    v
PostgreSQL
```

PostgREST is an implementation detail.

FusionDB owns:

- Public endpoint
- API key format
- Error shape
- Rate limits
- Documentation
- SDK
- Security context
- Product contract

This allows the internal API engine to evolve later without breaking the public SDK unnecessarily.

---

## 13. JS/TS SDK Architecture

Initial package:

```text
@fusiondb/sdk
```

Suggested modules:

```text
src/
+-- client.ts
+-- query/
|   +-- builder.ts
|   +-- filters.ts
+-- errors/
+-- auth/
+-- types/
```

V0.1 public surface should stay small.

Example:

```ts
const fusion = createClient({
  url,
  key,
});

const products = await fusion
  .from("products")
  .select("*")
  .eq("active", true)
  .limit(20);
```

Avoid exposing raw internal PostgREST implementation terminology unless it is intentionally part of the FusionDB contract.

---

## 14. Authentication Separation

FusionDB has two distinct identity domains.

### Management Identity

Who can manage FusionDB infrastructure?

Examples:

- FusionDB account
- organization owner
- project admin

### Application Identity

Who is using the customer's application?

Examples:

- ecommerce buyer
- SaaS tenant member
- mobile app user

These identity systems may share libraries internally but must remain conceptually separate.

This separation is required for future Agent Identity as a third identity class.

---

## 15. Future Identity Classes

Long-term:

```text
Human Management Identity
Application End-User Identity
Service Identity
AI Agent Identity
```

All should eventually enter a common authorization/policy layer without pretending they are the same actor type.

---

## 16. Security Boundaries

Every V0.1 implementation must preserve these boundaries:

```text
Internet
  |
  v
Gateway Boundary
  |
  v
Control/Data Plane Boundary
  |
  v
Organization Boundary
  |
  v
Project Boundary
  |
  v
Environment Boundary
  |
  v
Database Role / RLS Boundary
```

A bug in one boundary should not automatically grant authority across all remaining boundaries.

---

## 17. API Key Classes

Initial design target:

### Publishable

```text
fpk_...
```

May be used in client applications only when paired with policies that make exposure acceptable.

### Secret

```text
fsk_...
```

Server-side only.

Never include in frontend bundles.

Future:

```text
fat_...   Agent token
fsvc_...  Service identity
```

Agent credentials are not required until V0.5.

---

## 18. Secrets

Rules:

- Secrets never belong in repository source.
- The console should reveal full secrets only at appropriate creation/reveal moments.
- Stored secrets should be encrypted.
- Logs must redact credential values.
- Internal credentials and customer credentials must be separate.
- `.env.example` contains names, never real credentials.

---

## 19. Logging and Audit

### Operational Logs

Machine-oriented:

- request ID
- service
- route
- duration
- status
- error
- project ID where permitted

### Audit Events

Security/product-oriented:

- user
- organization
- project
- action
- resource
- timestamp
- result
- origin metadata
- change metadata where applicable

Examples:

```text
project.created
project.deleted
database.table.created
database.sql.executed
api_key.created
api_key.revoked
member.role_changed
```

Do not put raw secrets into either stream.

---

## 20. Local Development

Target command eventually:

```bash
pnpm install
docker compose up -d
pnpm dev
```

Later, FusionDB CLI should simplify this toward:

```bash
fusion dev
```

Initial local components:

- Control-plane PostgreSQL
- Project PostgreSQL
- PostgREST
- Control API
- Gateway
- Console

Keep local bootstrap deterministic.

---

## 21. Deployment Evolution

### Stage A — Local

Docker Compose.

### Stage B — Private Alpha

Small managed/containerized deployment with clear service isolation and backups.

### Stage C — Public Alpha/Beta

Add:

- proper edge/WAF
- production secrets manager
- stronger queue/job system
- production observability
- automated backups/PITR
- metering
- incident procedures

### Stage D — Scale

Add only after real load requires:

- regional data planes
- dedicated compute
- advanced poolers
- stronger isolation tiers
- analytics engine
- event infrastructure

Kubernetes is not a V0.1 requirement.

---

## 22. Architecture for V0.5 Agents

V0.1 must leave room for:

```text
AI Agent
    |
    v
MCP / Agent Gateway
    |
    v
Agent Identity
    |
    v
AgentGuard / Policy Engine
    |
    +-- read project metadata
    +-- create sandbox/branch
    +-- propose migration
    +-- run validation
    |
    v
Fusion Change Plan
```

The agent must not require receiving a PostgreSQL superuser password.

---

## 23. Architecture for V2 Analytics

Future:

```text
PostgreSQL
    |
   CDC
    |
    v
Analytics Engine
(ClickHouse-class)
    |
    v
Fusion Analytics
```

The public Fusion project remains the abstraction.

Do not introduce this dependency into V0.1.

---

## 24. Architecture Decisions Frozen for Initial Implementation

| Decision | Baseline |
|---|---|
| Language | TypeScript-first |
| Console | Next.js App Router |
| API | Fastify |
| Monorepo | pnpm + Turborepo |
| Control DB | PostgreSQL |
| Project DB | PostgreSQL |
| Metadata ORM | Drizzle |
| Control Auth | Better Auth |
| Data API | PostgREST behind Fusion Gateway |
| Local runtime | Docker Compose |
| First SDK | JavaScript / TypeScript |
| Initial tenant unit | Organization -> Project |
| Initial environment | production |
| AI agent features | V0.5, not V0.1 |
| Analytics engine | V2, not V0.1 |

Changes to this table require an explicit architecture decision rather than an informal dependency swap.

---

## 25. Next Technical Action

After these foundation documents are accepted:

1. Initialize Git repository.
2. Initialize pnpm workspace.
3. Initialize Turborepo.
4. Create `apps/console`.
5. Create `apps/api`.
6. Create control-plane PostgreSQL.
7. Define organization/project metadata schema.
8. Implement account authentication.
9. Implement `POST /projects`.
10. Build provisioner.
11. Provision first project PostgreSQL database.
12. Connect from a clean external Node.js test application.

That completes Milestone 001 when isolation tests also pass.

---

## 26. Reference Decisions

The baseline choices were checked against current official documentation on 2026-08-15:

- Next.js App Router: https://nextjs.org/docs/app
- Fastify: https://fastify.dev/docs/latest/
- pnpm Workspaces: https://pnpm.io/workspaces
- Turborepo: https://turborepo.com/docs
- PostgREST: https://docs.postgrest.org/
- Better Auth: https://www.better-auth.com/docs
- Drizzle ORM: https://orm.drizzle.team/docs/overview
