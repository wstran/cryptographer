/**
 * Common types for cryptographer.js library
 */

/**
 * Input data that can be hashed or encrypted
 */
export type CryptoInput = string | Buffer | Uint8Array;

/**
 * Output format for hash functions
 */
export type HashOutput = 'hex' | 'base64' | 'binary' | 'buffer';

/**
 * Common hash options
 */
export interface HashOptions {
  /**
   * Output format for the hash
   * @default 'hex'
   */
  outputFormat?: HashOutput;
}

/**
 * Options for HMAC operations
 */
export interface HMACOptions extends HashOptions {
  /**
   * Secret key for HMAC
   */
  key: CryptoInput;
}

/**
 * Options for cipher operations
 */
export interface CipherOptions {
  /**
   * Encryption/Decryption key
   */
  key: CryptoInput;

  /**
   * Initialization vector
   */
  iv?: CryptoInput;

  /**
   * Cipher mode
   */
  mode?: 'cbc' | 'ecb' | 'ctr' | 'gcm';

  /**
   * Padding scheme
   */
  padding?: 'PKCS7' | 'NoPadding' | 'ZeroPadding';
}

/**
 * Options for key derivation functions
 */
export interface KDFOptions {
  /**
   * Salt for the KDF
   */
  salt: CryptoInput;

  /**
   * Number of iterations
   */
  iterations?: number;

  /**
   * Output key length in bytes
   */
  keyLength?: number;

  /**
   * Output format
   */
  outputFormat?: HashOutput;
}

/**
 * Options for Argon2
 */
export interface Argon2Options extends KDFOptions {
  /**
   * Memory cost in KB
   */
  memoryCost?: number;

  /**
   * Time cost (number of iterations)
   */
  timeCost?: number;

  /**
   * Parallelism factor
   */
  parallelism?: number;

  /**
   * Argon2 variant
   */
  variant?: 'argon2i' | 'argon2d' | 'argon2id';
}

/**
 * Options for bcrypt
 */
export interface BcryptOptions {
  /**
   * Cost factor (4-31)
   */
  rounds?: number;
}

/**
 * Generic hash function interface
 */
export interface HashFunction {
  /**
   * Hash the input data
   */
  (input: CryptoInput, options?: HashOptions): string | Buffer;

  /**
   * Create a hash instance for streaming
   */
  create(): HashInstance;
}

/**
 * Hash instance for streaming operations
 */
export interface HashInstance {
  /**
   * Update the hash with new data
   */
  update(data: CryptoInput): this;

  /**
   * Finalize and return the hash
   */
  digest(format?: HashOutput): string | Buffer;

  /**
   * Reset the hash instance
   */
  reset(): this;
}

/**
 * Cipher function interface
 */
export interface CipherFunction {
  /**
   * Encrypt data
   */
  encrypt(data: CryptoInput, options: CipherOptions): Buffer;

  /**
   * Decrypt data
   */
  decrypt(data: CryptoInput, options: CipherOptions): Buffer;
}

/**
 * Result of a benchmark run
 */
export interface BenchmarkResult {
  algorithm: string;
  operation: string;
  opsPerSecond: number;
  averageTime: number;
  totalTime: number;
  iterations: number;
}