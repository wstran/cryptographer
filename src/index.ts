/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */

// Export types (commented out to avoid module resolution issues)
// export * from './types';

// Import all modules
import { hash } from './hash';
import { cipher } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';

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
  aes
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

// Export grouped modules
export {
  hash,
  cipher,
  hmac,
  kdf
};

// Default export with all modules
const cryptographer = {
  hash,
  cipher,
  hmac,
  kdf
};

export default cryptographer;