import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function keyFromBase64(keyBase64: string): Buffer {
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) throw new Error('FUSION_MASTER_KEY_B64 must decode to exactly 32 bytes');
  return key;
}

export function encryptSecret(plaintext: string, keyBase64: string): string {
  const key = keyFromBase64(keyBase64);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
}

export function decryptSecret(payload: string, keyBase64: string): string {
  const [version, ivEncoded, tagEncoded, dataEncoded] = payload.split(':');
  if (version !== 'v1' || !ivEncoded || !tagEncoded || !dataEncoded) throw new Error('Unsupported encrypted secret payload');
  const key = keyFromBase64(keyBase64);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivEncoded, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataEncoded, 'base64url')), decipher.final()]).toString('utf8');
}
