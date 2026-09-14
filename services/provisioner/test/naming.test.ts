import assert from 'node:assert/strict';
import test from 'node:test';
import { provisionProjectDatabase } from '../src/index.js';

test('provisioner API exports the provisioning function', () => {
  assert.equal(typeof provisionProjectDatabase, 'function');
});
