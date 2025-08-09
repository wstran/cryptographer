/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */

// Export types for TypeScript consumers
export * from './types';

// Import all modules
import { hash as _hashInternal, sha } from './hash';
import { cipher, aes, chacha20, des, rsa_oaep, x25519, ecdh } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';
import { dsa, ed25519, ecdsa, rsa } from './dsa';
import { randomBytes as nodeRandomBytes, timingSafeEqual as nodeTimingSafeEqual } from 'crypto';
import type { CryptoInput } from './types';
import { convertToBuffer, timeSafeEqual as fallbackTimingSafeEqual } from './utils/validation';

// Re-export individual functions for convenience
export {
  // Hash functions
  sha1,
  sha256,
  sha512,
  sha3_256,
  sha3_512,
  md4,
  md5,
  blake2b,
  blake2s,
  blake3,
  whirlpool,
  ripemd160
} from './hash';

export {
  // Cipher functions
  aes,
  chacha20,
  des,
  rsa_oaep,
  x25519,
  ecdh
} from './cipher';

export {
  // HMAC functions
  hmacSHA1,
  hmacSHA256,
  hmacSHA512,
  hmacMD5
} from './hmac';

export {
  // KDF functions
  pbkdf2,
  argon2,
  bcrypt
} from './kdf';

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
  ed25519,
  ecdsa,
  rsa
};

// Default export with all modules
const cryptographer: {
  sha: typeof sha;
  cipher: typeof cipher;
  hmac: typeof hmac;
  kdf: typeof kdf;
  rsa_oaep: typeof rsa_oaep;
  x25519: typeof x25519;
  ecdh: typeof ecdh;
  dsa: typeof dsa;
  ed25519: typeof ed25519;
  ecdsa: typeof ecdsa;
  rsa: typeof rsa;
  randomBytes: typeof randomBytes;
  timingSafeEqual: typeof timingSafeEqual;
} = {
  sha,
  cipher,
  hmac,
  kdf,
  rsa_oaep,
  x25519,
  ecdh,
  dsa,
  ed25519,
  ecdsa,
  rsa,
  randomBytes,
  timingSafeEqual
};

export default cryptographer;