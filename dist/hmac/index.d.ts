/**
 * HMAC (Hash-based Message Authentication Code) module
 */
import { CryptoInput, HMACOptions } from '../types';
export declare const hmacSHA1: (data: CryptoInput, options: HMACOptions) => string | Buffer;
export declare const hmacSHA256: (data: CryptoInput, options: HMACOptions) => string | Buffer;
export declare const hmacSHA512: (data: CryptoInput, options: HMACOptions) => string | Buffer;
export declare const hmacMD5: (data: CryptoInput, options: HMACOptions) => string | Buffer;
export declare const hmac: {
    sha1: (data: CryptoInput, options: HMACOptions) => string | Buffer;
    sha256: (data: CryptoInput, options: HMACOptions) => string | Buffer;
    sha512: (data: CryptoInput, options: HMACOptions) => string | Buffer;
    md5: (data: CryptoInput, options: HMACOptions) => string | Buffer;
};
//# sourceMappingURL=index.d.ts.map