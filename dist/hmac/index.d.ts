/**
 * HMAC (Hash-based Message Authentication Code) module
 */
import { CryptoInput, HMACOptions, HashOutput, HmacInstance } from '../types';
export declare const hmacSHA1: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
    create: (options: {
        key: CryptoInput;
        outputFormat?: HashOutput;
    }) => HmacInstance;
};
export declare const hmacSHA256: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
    create: (options: {
        key: CryptoInput;
        outputFormat?: HashOutput;
    }) => HmacInstance;
};
export declare const hmacSHA512: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
    create: (options: {
        key: CryptoInput;
        outputFormat?: HashOutput;
    }) => HmacInstance;
};
export declare const hmacMD5: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
    create: (options: {
        key: CryptoInput;
        outputFormat?: HashOutput;
    }) => HmacInstance;
};
export declare const hmac: {
    sha1: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
        create: (options: {
            key: CryptoInput;
            outputFormat?: HashOutput;
        }) => HmacInstance;
    };
    sha256: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
        create: (options: {
            key: CryptoInput;
            outputFormat?: HashOutput;
        }) => HmacInstance;
    };
    sha512: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
        create: (options: {
            key: CryptoInput;
            outputFormat?: HashOutput;
        }) => HmacInstance;
    };
    md5: ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
        create: (options: {
            key: CryptoInput;
            outputFormat?: HashOutput;
        }) => HmacInstance;
    };
};
//# sourceMappingURL=index.d.ts.map