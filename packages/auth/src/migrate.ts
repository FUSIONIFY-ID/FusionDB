import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Pool } from 'pg';

const connectionString = process.env.CONTROL_DATABASE_URL ??
  'postgresql://fusion_control:fusion_control_local@localhost:5432/fusion_control';
const here = dirname(fileURLToPath(import.meta.url));
const migration = await readFile(resolve(here, '../migrations/0000_better_auth.sql'), 'utf8');
const pool = new Pool({ connectionString });
try {
  await pool.query(migration);
  console.log('FusionDB management-auth migration applied.');
} finally {
  await pool.end();
}
