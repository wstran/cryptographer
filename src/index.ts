/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */

// Export types for TypeScript consumers
export * from './types';

// Import all modules (namespaced only)
import { hash as _hashInternal, sha } from './hash';
import { cipher } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';
import { dsa } from './dsa';
import { randomBytes as nodeRandomBytes, timingSafeEqual as nodeTimingSafeEqual } from 'crypto';
import type { CryptoInput } from './types';
import { convertToBuffer, timeSafeEqual as fallbackTimingSafeEqual } from './utils/validation';
import { zk } from './zk';

// Do NOT re-export individual leaf functions. Consumers must use namespaced
// access patterns like cryptographer.sha.sha256, cryptographer.cipher.aes, etc.

// Utility helpers
export function randomBytes(size: number): Buffer {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error('randomBytes size must be a positive integer');
  }
  return nodeRandomBytes(size);
}

export function timingSafeEqual(a: CryptoInput, b: CryptoInput): boolean {
  const ab = convertToBuffer(a);
  const bb = convertToBuffer(b);
  if (typeof nodeTimingSafeEqual === 'function') {
    if (ab.length !== bb.length) return false;
    return nodeTimingSafeEqual(ab, bb);
  }
  return fallbackTimingSafeEqual(ab, bb);
}

// Export grouped modules
export {
  sha,
  cipher,
  hmac,
  kdf,
  dsa,
  zk
};

// Default export with all modules
const cryptographer: {
  sha: typeof sha;
  cipher: typeof cipher;
  hmac: typeof hmac;
  kdf: typeof kdf;
  dsa: typeof dsa;
  randomBytes: typeof randomBytes;
  timingSafeEqual: typeof timingSafeEqual;
  zk: typeof zk;
} = {
  sha,
  cipher,
  hmac,
  kdf,
  dsa,
  randomBytes,
  timingSafeEqual,
  zk
};

export default cryptographer;