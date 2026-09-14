import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal','error','warn','info','debug','trace','silent']).default('info'),
  FUSION_CONSOLE_URL: z.string().url().default('http://localhost:3000'),
  CONTROL_DATABASE_URL: z.string().min(1).default('postgresql://fusion_control:fusion_control_local@localhost:5432/fusion_control'),
  PROJECT_DB_ADMIN_URL: z.string().min(1).default('postgresql://fusion_internal_admin:fusion_project_admin_local@localhost:5433/postgres'),
  PROJECT_DB_PUBLIC_HOST: z.string().min(1).default('localhost'),
  PROJECT_DB_PUBLIC_PORT: z.coerce.number().int().min(1).max(65535).default(5433),
  FUSION_MASTER_KEY_B64: z.string().min(1).default('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='),
});
export type ApiEnv = z.infer<typeof envSchema>;
export function loadEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv { return envSchema.parse(source); }
