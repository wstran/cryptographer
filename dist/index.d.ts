/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */
export * from './types';
import { sha } from './hash';
import { cipher } from './cipher';
import { hmac } from './hmac';
import { kdf } from './kdf';
import { dsa } from './dsa';
import type { CryptoInput } from './types';
import { zk } from './zk';
export declare function randomBytes(size: number): Buffer;
export declare function timingSafeEqual(a: CryptoInput, b: CryptoInput): boolean;
export { sha, cipher, hmac, kdf, dsa, zk };
declare const cryptographer: {
    sha: typeof sha;
    cipher: typeof cipher;
    hmac: typeof hmac;
    kdf: typeof kdf;
    dsa: typeof dsa;
    randomBytes: typeof randomBytes;
    timingSafeEqual: typeof timingSafeEqual;
    zk: typeof zk;
};
export default cryptographer;
//# sourceMappingURL=index.d.ts.map