/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */
export * from './types';
import { sha } from './hash';
import { cipher, rsa_oaep, x25519, ecdh } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';
import { dsa, ed25519, ecdsa, rsa } from './dsa';
import type { CryptoInput } from './types';
import { zk } from './zk';
export { sha1, sha256, sha512, sha3_256, sha3_512, md4, md5, blake2b, blake2s, blake3, whirlpool, ripemd160 } from './hash';
export { aes, chacha20, des, rsa_oaep, x25519, ecdh } from './cipher';
export { hmacSHA1, hmacSHA256, hmacSHA512, hmacMD5 } from './hmac';
export { pbkdf2, argon2, bcrypt } from './kdf';
export declare function randomBytes(size: number): Buffer;
export declare function timingSafeEqual(a: CryptoInput, b: CryptoInput): boolean;
export { sha, cipher, hmac, kdf, dsa, ed25519, ecdsa, rsa, zk };
declare const cryptographer: {
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
    zk: typeof zk;
};
export default cryptographer;
//# sourceMappingURL=index.d.ts.map