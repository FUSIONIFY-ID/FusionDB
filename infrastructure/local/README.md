# FusionDB Local Infrastructure

M001 uses two PostgreSQL services to make the control-plane/data-plane boundary visible from day one.

## Services

| Service | Port | Purpose |
|---|---:|---|
| `control-db` | 5432 | FusionDB-owned users, organizations, projects and provisioning metadata |
| `project-db` | 5433 | Local infrastructure where customer project databases will be provisioned |

Both use PostgreSQL 18.4 for the M001 baseline.

## Commands

From the repository root:

```bash
pnpm db:up
pnpm db:logs
pnpm db:down
```

To remove all local DB volumes:

```bash
pnpm db:reset
```

Credentials in the local compose file are development-only. Production secrets must use a dedicated secrets system.
