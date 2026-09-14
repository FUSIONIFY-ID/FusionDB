import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const connectionString = process.env.CONTROL_DATABASE_URL ??
  'postgresql://fusion_control:fusion_control_local@localhost:5432/fusion_control';

export const controlPool = new Pool({ connectionString, max: 10 });
export const db = drizzle({ client: controlPool, schema });

export async function pingControlDatabase(): Promise<void> {
  await controlPool.query('select 1');
}
