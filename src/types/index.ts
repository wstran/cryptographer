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
 * Options for BLAKE3
 * Note: We accept both camelCase and snake_case for convenience.
 */
export interface Blake3Options extends HashOptions {
  /** 32-byte key for keyed hashing (Uint8Array | Buffer | string) */
  keyed?: CryptoInput;
  /** Context string for derive key mode (camelCase variant) */
  deriveKey?: string;
  /** Context string for derive key mode (snake_case variant) */
  derive_key?: string;
  /** Desired output length for XOF mode (camelCase variant) */
  hashLength?: number;
  /** Desired output length for XOF mode (snake_case variant) */
  hash_length?: number;
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

// Aliases to match docs naming conventions
export type HmacOutput = HashOutput;
export interface HmacOptions extends HashOptions {
  key: CryptoInput;
}

export type CipherMode = 'cbc' | 'ecb' | 'ctr' | 'gcm' | 'ccm' | 'siv';

export type Argon2Variant = 'id' | 'i' | 'd';

export interface Pbkdf2Options extends KDFOptions {
  hash?: 'sha1' | 'sha256' | 'sha512';
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
  mode?: CipherMode;

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

  /**
   * Argon2 variant
   */
  /** Short variants supported in docs: 'i' | 'd' | 'id' */
  variant?: 'argon2i' | 'argon2d' | 'argon2id' | 'i' | 'd' | 'id';
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
  create(options?: HashOptions): HashInstance;
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

/** Streaming HMAC instance (used by crypto.hmac.X.create()) */
export interface HmacInstance {
  update(data: CryptoInput): this;
  digest(format?: HashOutput): string | Buffer;
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

// DSA types
export type EcdsaCurve = 'p256' | 'secp256k1';
export type RsaHash = 'sha256' | 'sha384' | 'sha512';

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

// =========================
// ZK/Groth16 Types
// =========================

/** Input accepted for URLs or binary blobs */
export type UrlOrBin = string | Buffer | Uint8Array | URL;

/** Standard snarkjs proof JSON shape for Groth16 */
export interface Groth16Proof {
  pi_a: [string, string, string?];
  pi_b: [[string, string], [string, string], [string, string]?];
  pi_c: [string, string, string?];
  protocol?: 'groth16';
  curve?: string;
  [key: string]: unknown;
}

export interface Groth16ProveResult {
  proof: Groth16Proof;
  publicSignals: string[];
}

export type Groth16SerializeFormat = 'buffer' | 'base64' | 'hex' | 'json';
