# Next Action

## Current target: M001-B/C

The repository now contains the Control Plane model, management auth, project provisioning, encrypted direct credentials, and an M001 E2E test.

### Validate in GitHub Actions

Push the increment and wait for `FusionDB M001 CI`.

A green workflow proves:

```text
Sign Up
-> Organization
-> Project A provisioned
-> Project B provisioned
-> Node.js connects to Project A
-> CREATE / INSERT / SELECT
-> Project A credential -> Project B = DENIED
```

### After M001 goes green

Proceed to M002 Database Management:

- project database introspection
- table list
- create table
- columns
- rows editor
- foreign keys
- indexes
- SQL Editor

Do not start ClickHouse, MCP, AgentGuard, analytics, storage, or the marketing site yet.
