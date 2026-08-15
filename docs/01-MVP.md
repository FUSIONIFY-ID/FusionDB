# FusionDB V0.1 MVP

**Document:** `01-MVP.md`  
**Status:** Scope Freeze v0.1  
**Date:** 2026-08-15

---

## 1. Objective

FusionDB V0.1 exists to prove one core hypothesis:

> A developer can create a FusionDB project, receive an isolated PostgreSQL backend, manage it visually, connect to it from a real application, and use an automatically generated API and SDK without assembling multiple backend services.

V0.1 is **not** intended to prove the complete long-term FusionDB vision.

---

## 2. V0.1 North Star Workflow

```text
Sign Up
   |
   v
Create Organization
   |
   v
Create Project
   |
   v
PostgreSQL Provisioned
   |
   v
Credentials Generated
   |
   +----------------------+
   |                      |
   v                      v
Fusion Console        Node.js App
   |                      |
   v                      v
Create Table         Connect / Query
   |
   v
Automatic Data API
   |
   v
Fusion JS/TS SDK
```

If this complete workflow works reliably, FusionDB V0.1 has achieved its purpose.

---

## 3. V0.1 Scope

### 3.1 Account and Control Plane Authentication

Required:

- Sign up
- Sign in
- Sign out
- Session management
- Account profile
- Password reset or equivalent recovery flow
- Basic security logging

This authentication protects the FusionDB management console.

---

### 3.2 Organizations

Required:

- Create organization
- Organization name and slug
- Organization owner
- Invite/member model can be minimal
- Basic roles:
  - Owner
  - Admin
  - Member
- Organization-level audit events

V0.1 does not require enterprise SSO or SCIM.

---

### 3.3 Projects

Required:

- Create project
- Project name
- Project ID
- Region field
- Project status
- Delete project with destructive confirmation
- Project settings
- Default `production` environment

Project IDs should be opaque identifiers such as:

```text
prj_xxxxxxxxxxxx
```

The displayed project name must never be used as the primary authorization boundary.

---

### 3.4 PostgreSQL Provisioning

For V0.1:

- PostgreSQL is the transactional database engine.
- Each FusionDB project receives an isolated project database.
- Each project receives dedicated database credentials/roles.
- Control-plane metadata is stored separately from customer project data.
- Project application roles must never be PostgreSQL superusers.
- Credentials must be generated securely and stored as secrets.

Initial local/alpha architecture may run several project databases on a shared PostgreSQL infrastructure, provided logical isolation is enforced.

Dedicated clusters are not required for V0.1.

---

### 3.5 Database Connection

Each project must expose:

#### Direct PostgreSQL connection

```env
DATABASE_URL=postgresql://...
```

#### Fusion API endpoint

```env
FUSIONDB_URL=https://<project>.fusiondb.local
```

#### Public/secret key model

Initial naming target:

```env
FUSIONDB_PUBLIC_KEY=fpk_...
FUSIONDB_SECRET_KEY=fsk_...
```

A pooler endpoint may be introduced during V0.1 if required by deployment architecture, but it must not delay Milestone 001.

---

### 3.6 Database Console

#### Tables

- List schemas/tables
- Create table
- Delete table with confirmation
- Rename table
- View estimated/exact row count where practical

#### Columns

- Add column
- Rename column
- Change supported column properties
- Nullable configuration
- Default values
- Primary key
- Common PostgreSQL data types

#### Rows

- Browse rows
- Pagination
- Filter
- Sort
- Insert row
- Edit row
- Delete row
- Safe handling of null and structured values

#### Relationships

- View foreign keys
- Create basic foreign key
- Remove foreign key with impact confirmation

#### Indexes

- List indexes
- Create common index
- Delete index

A full DBA surface is not required.

---

### 3.7 SQL Editor

Required:

- Query editor
- Run SQL
- Results table
- Execution time
- Error display
- Query history for current user/project
- Explicit warning for destructive statements
- Statement timeout
- Server-side authorization

Future:

- AI query explanation
- Query optimization
- Query cost estimation
- collaborative SQL notebooks

---

### 3.8 Automatic Data API

FusionDB V0.1 must expose PostgreSQL data through a REST API.

Target behavior:

```http
GET    /v1/<table>
POST   /v1/<table>
PATCH  /v1/<table>?...
DELETE /v1/<table>?...
```

The internal implementation may use PostgREST behind the Fusion Gateway.

Fusion Gateway remains responsible for platform concerns such as:

- Project resolution
- Authentication context
- API keys
- Rate limits
- Request logging
- Policy enforcement
- Error normalization

Clients should not connect directly to the internal PostgREST service.

---

### 3.9 FusionDB JavaScript / TypeScript SDK

Initial package:

```text
@fusiondb/sdk
```

Minimum target API:

```ts
import { createClient } from "@fusiondb/sdk";

const fusion = createClient({
  url: process.env.FUSIONDB_URL!,
  key: process.env.FUSIONDB_SECRET_KEY!
});

const rows = await fusion
  .from("products")
  .select();
```

V0.1 methods:

- `select`
- `insert`
- `update`
- `delete`
- filtering
- ordering
- limit/pagination
- normalized errors

The SDK should call the Fusion Data API by default.

Direct PostgreSQL remains available to server-side developers.

---

### 3.10 Basic Application Auth

Distinguish this from management console authentication.

FusionDB V0.1 should include a minimal customer-application authentication capability after the core database/API workflow is stable.

Minimum:

- End-user sign up
- End-user sign in
- Session/token
- User ID
- Auth context available to Data API policies

Not required:

- Social login
- Passkeys
- SAML
- SCIM
- Enterprise identity federation

These belong later.

---

### 3.11 Security Baseline

V0.1 cannot ship without:

- Organization authorization
- Project authorization
- Database role isolation
- No customer-facing database superuser credentials
- API key scopes
- Secure secret storage
- TLS in deployed environments
- RLS/policy support for exposed application data
- Rate limiting
- Query timeout
- Payload size limits
- Audit logs
- Destructive action confirmations
- Backups for alpha/production data
- Separation between control-plane metadata and project data

Security warnings alone are not authorization.

---

## 4. Milestones

### M001 — Project -> Database -> Connection

Definition:

```text
Account
  -> Organization
  -> Create Project
  -> PostgreSQL Database Provisioned
  -> Credentials Generated
  -> External Node.js App Connects
  -> CREATE / INSERT / SELECT succeeds
```

**This is the first true FusionDB milestone.**

#### Done when

- Project provisioning is automated.
- Credentials are not manually created by a developer.
- External Node.js can connect using generated credentials.
- Project A credentials cannot access Project B data.

---

### M002 — Database Management

Deliver:

- Database page
- Table list
- Create table
- Column editor
- Row editor
- Foreign keys
- Indexes
- SQL Editor

#### Done when

A developer can create and modify a small application schema without leaving FusionDB Console.

---

### M003 — Automatic API

Deliver:

- Fusion Gateway
- Data API routing
- Project identification
- API key validation
- CRUD API
- Rate limit
- Request logs
- OpenAPI exposure or generated API reference

#### Done when

A frontend/backend app can perform CRUD through FusionDB without direct SQL access.

---

### M004 — JS/TS SDK

Deliver:

- `@fusiondb/sdk`
- Client initialization
- CRUD query builder
- Error model
- TypeScript types
- Quick-start example

#### Done when

A Node.js project can install the SDK and perform application CRUD through FusionDB.

---

### M005 — Auth + Policy

Deliver:

- Basic end-user auth
- Auth identity propagated to Data API
- Basic RLS/policy workflow
- Security audit events

#### Done when

Two different end users can access the same FusionDB project while policies prevent them from reading or modifying unauthorized rows.

---

## 5. Explicitly Out of Scope for V0.1

Do **not** add these to the V0.1 critical path:

### AI / Agents

- MCP server
- Fusion Agent
- Agent Identity
- AgentGuard
- Agent Sandbox
- Fusion Change Plan
- Agent Time Machine
- Autonomous production changes
- AI Gateway

These begin in V0.5.

### Data Platform

- ClickHouse
- OLAP routing
- Dashboards
- Data warehouse
- CDC
- ETL pipelines
- Data lineage
- Data catalog
- Streaming

These begin in V2.

### Advanced Backend

- Object Storage
- Production Functions
- Queue
- Workflows
- Advanced Realtime
- Notification platform
- Feature flags
- Remote config

These belong primarily to V1+.

### Enterprise

- SAML
- SCIM
- BYOC
- VPC peering
- Dedicated regions
- Customer-managed encryption keys
- Formal compliance certification
- Global database

These belong later.

---

## 6. V0.1 Console Navigation

Keep the navigation intentionally small.

```text
FusionDB

Overview

BUILD
- Database
- Auth
- API

OPERATE
- Logs

DEVELOPER
- Connect
- API Keys

PROJECT
- Settings
```

Future features should not appear as disabled menu spam.

---

## 7. V0.1 Definition of Done

FusionDB V0.1 is considered complete only if all statements below are true.

### Product

- A new user understands how to create a project without assistance.
- Project provisioning is automated.
- The console shows project status clearly.

### Database

- Project DB is reachable.
- Table editor works.
- SQL Editor works.
- Project isolation is tested.

### API

- CRUD API works.
- API keys are scoped.
- Rate limiting exists.
- API errors are understandable.

### SDK

- Published/installable package works in Node.js.
- Quick-start code works from a clean project.

### Auth/Security

- Control-plane auth works.
- Basic application auth works.
- RLS/policy example works.
- Audit events are generated.
- No public superuser credential is exposed.

### Operations

- Service health is observable.
- Errors are logged.
- Backup process is documented and tested for the environment being used.

---

## 8. Success Metrics for Alpha

Initial metrics should focus on product proof rather than vanity.

### Activation

A developer successfully reaches:

```text
Create Account
-> Create Project
-> Connect Application
-> First Successful Query
```

### Time to First Query

Track the time from project creation to the first successful external query.

### Provisioning Reliability

Track:

- Provision attempts
- Provision success rate
- Provision duration
- Rollback/cleanup failures

### Security

Track:

- Cross-project isolation tests
- Unauthorized API attempts
- Secret exposure findings
- Destructive query blocks/timeouts

### Developer Experience

Track:

- Failed setup steps
- SDK errors
- API errors
- Documentation drop-off points

---

## 9. Scope Change Rule

A feature may enter V0.1 only if:

1. It is required for M001-M005.
2. The core workflow cannot be safely completed without it.
3. Its absence would invalidate the V0.1 product hypothesis.

Everything else goes to the roadmap.

---

## 10. After V0.1

The next product thesis is V0.5:

> Can an AI coding agent safely inspect and modify a FusionDB backend through explicit identities, capabilities, branches/sandboxes, reviewable Change Plans, audit logs, and production safety boundaries?

Only start V0.5 after V0.1 meets its Definition of Done.
