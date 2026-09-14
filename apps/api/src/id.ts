import { randomBytes } from 'node:crypto';
export function makeId(prefix: string): string { return `${prefix}_${randomBytes(12).toString('base64url')}`; }
export function slugify(input: string): string {
  const value = input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return value || 'organization';
}
