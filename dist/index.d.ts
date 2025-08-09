/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */
import { hash } from './hash';
import { cipher, rsa_oaep, x25519, ecdh } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';
import { dsa, ed25519, ecdsa, rsa } from './dsa';
export { sha1, sha256, sha512, sha3_256, sha3_512, md4, md5, blake2b, blake2s, blake3, whirlpool, ripemd160 } from './hash';
export { aes, chacha20, des, rsa_oaep, x25519, ecdh } from './cipher';
export { hmacSHA1, hmacSHA256, hmacSHA512, hmacMD5 } from './hmac';
export { pbkdf2, argon2, bcrypt } from './kdf';
export { hash, cipher, hmac, kdf, dsa, ed25519, ecdsa, rsa };
declare const cryptographer: {
    hash: typeof hash;
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
};
export default cryptographer;
//# sourceMappingURL=index.d.ts.map