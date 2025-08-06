/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */
import { hash } from './hash';
import { cipher } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';
export { sha1, sha256, sha512, sha3_256, sha3_512, md4, md5, blake2b, blake2s, blake3, whirlpool, ripemd160 } from './hash';
export { aes } from './cipher';
export { hmacSHA1, hmacSHA256, hmacSHA512, hmacMD5 } from './hmac';
export { pbkdf2, argon2, bcrypt } from './kdf';
export { hash, cipher, hmac, kdf };
declare const cryptographer: {
    hash: {
        sha1: import("./types").HashFunction;
        sha256: import("./types").HashFunction;
        sha512: import("./types").HashFunction;
        sha3_256: import("./types").HashFunction;
        sha3_512: import("./types").HashFunction;
        md4: import("./types").HashFunction;
        md5: import("./types").HashFunction;
        blake2b: import("./types").HashFunction;
        blake2s: import("./types").HashFunction;
        blake3: import("./types").HashFunction;
        whirlpool: import("./types").HashFunction;
        ripemd160: import("./types").HashFunction;
    };
    cipher: {
        aes: import("./types").CipherFunction;
    };
    hmac: {
        sha1: (data: import("./types").CryptoInput, options: import("./types").HMACOptions) => string | Buffer;
        sha256: (data: import("./types").CryptoInput, options: import("./types").HMACOptions) => string | Buffer;
        sha512: (data: import("./types").CryptoInput, options: import("./types").HMACOptions) => string | Buffer;
        md5: (data: import("./types").CryptoInput, options: import("./types").HMACOptions) => string | Buffer;
    };
    kdf: {
        pbkdf2: (password: import("./types").CryptoInput, options: import("./types").KDFOptions) => string | Buffer;
        argon2: (password: import("./types").CryptoInput, options: import("./types").Argon2Options) => string | Buffer;
        bcrypt: {
            hash(password: import("./types").CryptoInput, options?: import("./types").BcryptOptions): string;
            verify(password: import("./types").CryptoInput, hash: string): boolean;
        };
    };
};
export default cryptographer;
//# sourceMappingURL=index.d.ts.map