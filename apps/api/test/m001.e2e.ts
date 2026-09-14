import assert from 'node:assert/strict';
import { Client } from 'pg';

const base = process.env.E2E_BASE_URL ?? 'http://localhost:4000';
let cookie = '';
async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  if (cookie) headers.set('cookie', cookie);
  const response = await fetch(`${base}${path}`, { ...init, headers });
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length) cookie = setCookies.map((v) => v.split(';')[0]).join('; ');
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}
async function waitReady(projectId: string) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const { response, body } = await request(`/v1/projects/${projectId}`);
    assert.equal(response.status, 200);
    if (body.project.status === 'ready') return body.project;
    if (body.project.status === 'failed') throw new Error(`Project ${projectId} provisioning failed`);
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${projectId}`);
}
async function createProject(organizationId: string, name: string) {
  const created = await request('/v1/projects', { method: 'POST', body: JSON.stringify({ organizationId, name, region: 'local' }) });
  assert.equal(created.response.status, 202);
  await waitReady(created.body.project.id);
  const conn = await request(`/v1/projects/${created.body.project.id}/connection`);
  assert.equal(conn.response.status, 200);
  return { id: created.body.project.id as string, url: conn.body.connection.url as string };
}

const signup = await request('/api/auth/sign-up/email', { method: 'POST', body: JSON.stringify({ name: 'Fusion CI', email: `ci-${Date.now()}@fusiondb.local`, password: 'FusionDB-CI-Password-123!' }) });
assert.equal(signup.response.ok, true, JSON.stringify(signup.body));
assert.ok(cookie, 'Better Auth must issue a session cookie');

const org = await request('/v1/organizations', { method: 'POST', body: JSON.stringify({ name: 'Fusion CI Org' }) });
assert.equal(org.response.status, 201);
const organizationId = org.body.organization.id as string;

const a = await createProject(organizationId, 'Project A');
const b = await createProject(organizationId, 'Project B');

const clientA = new Client({ connectionString: a.url });
await clientA.connect();
await clientA.query('create table if not exists m001_test(id integer primary key, value text not null)');
await clientA.query("insert into m001_test(id, value) values (1, 'fusiondb') on conflict (id) do update set value=excluded.value");
const selected = await clientA.query('select value from m001_test where id=1');
assert.equal(selected.rows[0]?.value, 'fusiondb');
await clientA.end();

const aUrl = new URL(a.url); const bUrl = new URL(b.url);
bUrl.username = aUrl.username; bUrl.password = aUrl.password;
let isolationBlocked = false;
const cross = new Client({ connectionString: bUrl.toString(), connectionTimeoutMillis: 3000 });
try { await cross.connect(); } catch { isolationBlocked = true; } finally { await cross.end().catch(() => undefined); }
assert.equal(isolationBlocked, true, 'Project A credential must not connect to Project B database');
console.log('M001 E2E PASS: auth, organization, provisioning, direct SQL and cross-project isolation verified.');
