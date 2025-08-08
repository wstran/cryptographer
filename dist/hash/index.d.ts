/**
 * Hash algorithms module
 */
import { CryptoInput, HashFunction, HashInstance, Blake3Options } from '../types';
export declare const sha1: HashFunction;
export declare const sha256: HashFunction;
export declare const sha512: HashFunction;
export declare const sha3_256: HashFunction;
export declare const sha3_512: HashFunction;
export declare const md4: HashFunction;
export declare const md5: HashFunction;
export declare const blake2b: HashFunction;
export declare const blake2s: HashFunction;
export declare const blake3: {
    (input: CryptoInput, options?: Blake3Options): string | Buffer;
    create(options?: Blake3Options): HashInstance;
};
export declare const whirlpool: HashFunction;
export declare const ripemd160: HashFunction;
export declare const hash: {
    sha1: HashFunction;
    sha256: HashFunction;
    sha512: HashFunction;
    sha3_256: HashFunction;
    sha3_512: HashFunction;
    md4: HashFunction;
    md5: HashFunction;
    blake2b: HashFunction;
    blake2s: HashFunction;
    blake3: {
        (input: CryptoInput, options?: Blake3Options): string | Buffer;
        create(options?: Blake3Options): HashInstance;
    };
    whirlpool: HashFunction;
    ripemd160: HashFunction;
};
//# sourceMappingURL=index.d.ts.map