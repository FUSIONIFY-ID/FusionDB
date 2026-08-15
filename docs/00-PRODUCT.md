# FusionDB Product Foundation

**Document:** `00-PRODUCT.md`  
**Status:** Foundation v0.1  
**Date:** 2026-08-15  
**Product:** FusionDB  
**Tagline:** **Everything your app needs. Fused.**

---

## 1. Product Definition

FusionDB is an **AI-native backend and data platform** that unifies application databases, backend services, security, analytics, operations, and AI-agent workflows into one developer experience.

FusionDB is not intended to replace every storage engine internally. It provides a unified product layer over specialized infrastructure so developers experience **one project, one SDK, one policy model, and one AI interface**.

---

## 2. Vision

Make building and operating software infrastructure feel as simple as creating a single project.

A developer should be able to create a FusionDB project and receive the core backend and data capabilities required to build an application without manually assembling multiple unrelated vendors.

Long term, FusionDB should serve:

- Web applications
- Mobile applications
- SaaS products
- AI-native applications
- Internal tools
- Data-intensive products
- Analytics workloads
- Developer platforms
- Enterprise workloads

The first product version will **not** attempt to serve all of these equally.

---

## 3. Mission

FusionDB exists to reduce the infrastructure fragmentation developers face when building modern software.

FusionDB should:

1. Remove repetitive backend setup.
2. Keep application data and backend services in one coherent project.
3. Remain compatible with open standards and existing developer tools.
4. Make AI coding agents first-class clients without giving them uncontrolled authority.
5. Provide secure defaults before convenience.
6. Allow developers to start small and scale without rebuilding the entire backend stack.

---

## 4. Initial Problem

Modern developers frequently combine separate products for:

- Database
- Authentication
- API
- Storage
- Realtime
- Background jobs
- Analytics
- Search
- Vector retrieval
- Monitoring
- AI infrastructure

This fragmentation creates duplicated configuration, fragmented permissions, multiple SDKs, different billing systems, and additional operational complexity.

AI coding agents make application development faster, but introduce a second problem: agents may require powerful infrastructure access while existing database workflows are not designed around autonomous or semi-autonomous software actors.

---

## 5. First Target Market

FusionDB's initial customer is intentionally narrow.

### Primary

- AI-assisted developers
- Vibe coders
- Indie hackers
- SaaS developers
- Small startup engineering teams

### Secondary, Later

- Mobile engineering teams
- Agencies
- Data analysts
- Data engineers
- AI engineering teams
- Enterprise engineering organizations

FusionDB must win its first developer workflow before expanding to every workload.

---

## 6. Jobs To Be Done

### JTBD-01
When I start a new application, I want a production-oriented backend project created quickly so I can focus on the product rather than infrastructure setup.

### JTBD-02
When I modify my database, I want schema, API, permissions, and developer tooling to remain synchronized.

### JTBD-03
When an AI coding agent changes my backend, I want the agent to work independently where safe but be technically prevented from performing unauthorized production actions.

### JTBD-04
When my application grows, I want to add analytics, search, AI, and operational capabilities without migrating to an entirely different platform.

---

## 7. Core Value Proposition

### For developers

**Create one project instead of assembling an entire backend stack.**

### For AI-assisted development

**Let agents build infrastructure through controlled capabilities, sandboxes, change plans, and auditable permissions.**

### For growing products

**Start with transactional application infrastructure and expand into analytics, search, AI, and operations under the same platform identity.**

---

## 8. Core Product Principles

These principles are considered foundational.

### 8.1 One Project

All resources belong to a clear hierarchy:

`Organization -> Project -> Environment -> Branch -> Resource`

### 8.2 One SDK

The primary developer experience should feel unified:

```ts
fusion.db
fusion.auth
fusion.storage
fusion.functions
fusion.realtime
fusion.analytics
fusion.vector
fusion.ai
```

Not all namespaces ship in V0.1.

### 8.3 One Policy

Authorization should evolve toward one policy model covering database, storage, functions, analytics, agents, and other FusionDB resources.

### 8.4 One AI Interface

Fusion AI should eventually understand schema, backend code, logs, traces, security, analytics, cost, and infrastructure changes.

### 8.5 Open Standards

FusionDB should prefer interoperability over unnecessary lock-in.

Priority standards include:

- PostgreSQL protocol
- SQL
- REST
- OpenAPI
- OAuth/OIDC
- WebSocket
- S3-compatible object APIs, later
- OpenTelemetry, later
- MCP

### 8.6 Secure by Default

A fresh FusionDB project should be safer before users configure anything.

Security may not rely only on UI warnings.

### 8.7 Agents Are Untrusted Executors

An AI model or autonomous agent may request an action, but FusionDB determines whether it has authority to execute it.

### 8.8 Specialized Engines, Unified Experience

FusionDB may internally use different engines for different workloads.

Example long-term direction:

- PostgreSQL: transactional workload
- ClickHouse-class OLAP layer: analytical workload
- Object storage: files and archival data
- Search/vector infrastructure: retrieval workloads
- Queue/stream infrastructure: asynchronous workloads

The customer should not need to orchestrate these engines manually.

---

## 9. Product Pillars

FusionDB is organized into seven long-term pillars.

### Database

Transactional data, schema management, SQL, branching, migrations, connection management.

### Backend

Authentication, APIs, storage, functions, realtime, queues, cron, workflows, events.

### Data

Analytics, OLAP, search, vector retrieval, CDC, pipelines, dashboards, catalog and lineage.

### AI

Fusion AI, MCP, AI Gateway, Agent Identity, AgentGuard, Change Plans, sandboxes, agent sessions.

### Security

IAM, policies, RLS, secrets, DLP, audit, rate limiting, abuse prevention, application and agent security.

### Operate

Logs, metrics, traces, backups, PITR, scaling, regions, incident visibility, usage and cost.

### Developer

SDKs, CLI, local development, Git integration, framework integrations, migration tooling, documentation.

---

## 10. Initial Differentiation

FusionDB should **not** compete using "we have more features."

The intended differentiation is structural:

1. **One Project, One SDK, One Policy**
2. **Agent-native infrastructure**
3. **Safe autonomous backend changes**
4. **Fusion Change Plans**
5. **Agent Sandbox and branch-based workflows**
6. **Transactional and analytical workloads under one platform**
7. **Automatic workload routing, later**
8. **Fusion AI as an operator, not only a SQL chatbot**
9. **Native PostgreSQL compatibility**
10. **Security and cost controls designed for both humans and agents**

---

## 11. The Fusion Change Plan

The long-term signature workflow is a reviewable infrastructure change.

Example:

```text
Request
  |
  v
Agent understands project
  |
  v
Fusion Change Plan
  |
  +-- Schema changes
  +-- API changes
  +-- Policies
  +-- Functions
  +-- Analytics/events
  +-- Security impact
  +-- Cost impact
  |
  v
Sandbox / Preview
  |
  v
Validation
  |
  v
Human or policy approval
  |
  v
Production
```

This is a V0.5+ feature, not a V0.1 dependency.

---

## 12. What FusionDB Is

FusionDB is:

- A backend platform
- A database platform
- A developer platform
- An eventual data platform
- AI-agent aware
- API and SDK driven
- PostgreSQL compatible at its transactional core
- Designed for cloud use
- Designed around explicit isolation boundaries

---

## 13. What FusionDB Is Not

FusionDB V0.x is **not**:

- A new SQL storage engine
- A PostgreSQL replacement
- A ClickHouse replacement
- An AWS replacement
- A full frontend hosting platform
- A Kubernetes distribution
- A BI suite
- A general-purpose AI agent framework
- A product that attempts to implement every planned module at once

---

## 14. Product Experience

The dashboard should feel like a modern developer platform rather than a classic database administration panel.

The V0.1 console should prioritize:

- Projects
- Project health
- Database
- Table Editor
- SQL Editor
- API
- Authentication
- Connect
- API Keys
- Logs
- Settings

Advanced future modules must not appear as unfinished clutter in the V0.1 navigation.

---

## 15. Initial Product Promise

A developer should eventually be able to:

```text
Create FusionDB Project
        |
        v
Database ready
        |
        v
Connect application
        |
        v
Create schema
        |
        v
Automatic API available
        |
        v
Use Fusion SDK
        |
        v
Ship application
```

V0.1 exists to prove this workflow.

---

## 16. Long-Term Product Promise

The mature product aims for:

```text
Application
    |
    v
FusionDB
    |
    +-- Database
    +-- Backend
    +-- Data
    +-- AI
    +-- Security
    +-- Operations
```

The user interacts with FusionDB as one coherent platform even when multiple internal engines serve those workloads.

---

## 17. Business Direction

Planned commercial tiers:

- Free
- Lite
- Pro
- Plus
- Max
- Enterprise

The intended model is:

**Subscription + included usage + usage-based overages**

Free and Lite prioritize adoption. Pro is the primary production tier. Plus and Max focus on scale and advanced operations. Enterprise covers dedicated infrastructure, compliance, advanced IAM, data residency, private networking, and BYOC requirements.

Pricing numbers are **not frozen** in this document.

---

## 18. Product Success Criteria

FusionDB V0.1 succeeds when a developer can:

1. Create an account.
2. Create an organization.
3. Create a project.
4. Receive an isolated PostgreSQL database.
5. Obtain secure connection credentials.
6. Connect from an external Node.js application.
7. Create and manage database tables through the FusionDB console.
8. Execute SQL through the FusionDB console.
9. Access project data through an automatically generated API.
10. Use the JavaScript/TypeScript FusionDB SDK.
11. Use basic application authentication and authorization.
12. Review security-sensitive activity through audit logs.

---

## 19. Foundation Freeze

Until V0.1 is functional, new product ideas should be assigned to a future roadmap version instead of added to V0.1.

The question for any new feature is:

> Does this feature directly help prove the V0.1 project-to-database-to-API-to-SDK workflow?

If the answer is no, it belongs after V0.1.
