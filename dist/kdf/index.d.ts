/**
 * Key Derivation Functions (KDF) module
 */
import { CryptoInput, KDFOptions, Argon2Options, BcryptOptions } from '../types';
/**
 * Create PBKDF2 function
 */
export declare const pbkdf2: (password: CryptoInput, options: KDFOptions) => string | Buffer;
/**
 * Create Argon2 function
 */
export declare const argon2: (password: CryptoInput, options: Argon2Options) => string | Buffer;
/**
 * Create Bcrypt functions
 */
export declare const bcrypt: {
    hash(password: CryptoInput, options?: BcryptOptions): string;
    verify(password: CryptoInput, hash: string): boolean;
};
export declare const kdf: {
    pbkdf2: (password: CryptoInput, options: KDFOptions) => string | Buffer;
    argon2: (password: CryptoInput, options: Argon2Options) => string | Buffer;
    bcrypt: {
        hash(password: CryptoInput, options?: BcryptOptions): string;
        verify(password: CryptoInput, hash: string): boolean;
    };
};
//# sourceMappingURL=index.d.ts.map