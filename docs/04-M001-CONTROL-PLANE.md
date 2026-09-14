# M001-B/C: Control Plane and PostgreSQL Provisioning

This increment turns the FusionDB bootstrap into a functional vertical slice.

## Delivered

- Better Auth email/password management identity under `/api/auth/*`
- Organization ownership model
- Project metadata and production environment
- Provision job lifecycle
- PostgreSQL database-per-project provisioning on a shared project cluster
- Dedicated non-superuser login role per project
- `CONNECT` revoked from `PUBLIC` on every project database
- AES-256-GCM encryption for stored project database passwords
- Direct PostgreSQL connection endpoint for organization owner/admin
- Audit events for organization/project/provision lifecycle
- GitHub Actions M001 E2E validation

## API smoke flow

1. `POST /api/auth/sign-up/email`
2. `POST /v1/organizations`
3. `POST /v1/projects`
4. Poll `GET /v1/projects/:projectId`
5. `GET /v1/projects/:projectId/connection`
6. Connect with Node.js/PostgreSQL client

## Important security property

Each provisioned database executes:

```sql
REVOKE CONNECT ON DATABASE <project_db> FROM PUBLIC;
GRANT CONNECT ON DATABASE <project_db> TO <project_role>;
```

The CI E2E creates two projects and verifies that Project A's credentials are rejected by Project B's database.

## Alpha limitations

- Provision jobs are launched in-process instead of a durable queue.
- Direct project credentials are owner-like within their own database so M001 can prove CREATE/INSERT/SELECT.
- No automatic REST Data API yet. That starts at M003.
- No production secret manager yet; credentials are encrypted using `FUSION_MASTER_KEY_B64`.
- No credential rotation endpoint yet.
