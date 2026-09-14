import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptSecret, encryptSecret } from '../src/index.js';

const key = Buffer.alloc(32, 7).toString('base64');
test('secret encryption round-trips without plaintext storage', () => {
  const encrypted = encryptSecret('super-secret', key);
  assert.equal(encrypted.includes('super-secret'), false);
  assert.equal(decryptSecret(encrypted, key), 'super-secret');
});
