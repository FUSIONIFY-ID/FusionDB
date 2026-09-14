import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const connectionString = process.env.CONTROL_DATABASE_URL ??
  'postgresql://fusion_control:fusion_control_local@localhost:5432/fusion_control';

export const authPool = new Pool({
  connectionString,
  options: '-c search_path=auth',
  max: 10,
});

export const auth = betterAuth({
  appName: 'FusionDB',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
  secret: process.env.BETTER_AUTH_SECRET ?? 'local-development-only-change-me-please-32chars-minimum',
  database: authPool,
  trustedOrigins: [process.env.FUSION_CONSOLE_URL ?? 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  advanced: {
    database: {
      joins: true,
      generateId: 'uuid',
    },
  },
});
