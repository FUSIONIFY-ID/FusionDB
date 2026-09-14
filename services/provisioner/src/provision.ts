import { createHash, randomBytes } from 'node:crypto';
import { Client } from 'pg';

export type ProvisionProjectInput = {
  projectId: string;
  adminUrl: string;
  publicHost: string;
  publicPort: number;
};

export type ProvisionProjectResult = {
  databaseName: string;
  roleName: string;
  password: string;
  connectionUrl: string;
};

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
function suffixFor(projectId: string): string {
  return createHash('sha256').update(projectId).digest('hex').slice(0, 16);
}

export async function pingProjectDatabaseAdmin(adminUrl: string): Promise<void> {
  const client = new Client({ connectionString: adminUrl });
  try { await client.connect(); await client.query('select 1'); } finally { await client.end().catch(() => undefined); }
}

export async function provisionProjectDatabase(input: ProvisionProjectInput): Promise<ProvisionProjectResult> {
  const suffix = suffixFor(input.projectId);
  const databaseName = `fdb_${suffix}`;
  const roleName = `fdb_${suffix}_app`;
  const password = randomBytes(32).toString('base64url');
  const admin = new Client({ connectionString: input.adminUrl });
  await admin.connect();
  try {
    const roleExists = await admin.query<{ exists: boolean }>('select exists(select 1 from pg_roles where rolname = $1) as exists', [roleName]);
    if (!roleExists.rows[0]?.exists) {
      await admin.query(`CREATE ROLE ${quoteIdentifier(roleName)} LOGIN PASSWORD ${quoteLiteral(password)} NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
    } else {
      await admin.query(`ALTER ROLE ${quoteIdentifier(roleName)} PASSWORD ${quoteLiteral(password)}`);
    }

    const dbExists = await admin.query<{ exists: boolean }>('select exists(select 1 from pg_database where datname = $1) as exists', [databaseName]);
    if (!dbExists.rows[0]?.exists) {
      await admin.query(`CREATE DATABASE ${quoteIdentifier(databaseName)} OWNER ${quoteIdentifier(roleName)}`);
    }
    await admin.query(`REVOKE CONNECT ON DATABASE ${quoteIdentifier(databaseName)} FROM PUBLIC`);
    await admin.query(`GRANT CONNECT ON DATABASE ${quoteIdentifier(databaseName)} TO ${quoteIdentifier(roleName)}`);
  } catch (error) {
    try { await admin.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)} WITH (FORCE)`); } catch {}
    try { await admin.query(`DROP ROLE IF EXISTS ${quoteIdentifier(roleName)}`); } catch {}
    throw error;
  } finally {
    await admin.end();
  }

  const projectAdminUrl = new URL(input.adminUrl);
  projectAdminUrl.pathname = `/${databaseName}`;
  const hardener = new Client({ connectionString: projectAdminUrl.toString() });
  await hardener.connect();
  try {
    await hardener.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
    await hardener.query(`GRANT USAGE, CREATE ON SCHEMA public TO ${quoteIdentifier(roleName)}`);
  } finally {
    await hardener.end();
  }

  const url = new URL('postgresql://localhost');
  url.username = roleName;
  url.password = password;
  url.hostname = input.publicHost;
  url.port = String(input.publicPort);
  url.pathname = `/${databaseName}`;
  return { databaseName, roleName, password, connectionUrl: url.toString() };
}
