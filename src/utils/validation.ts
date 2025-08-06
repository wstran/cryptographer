/**
 * Validation utilities for cryptographer.js
 * 
 * This module provides input validation and error handling utilities
 * to ensure secure and reliable cryptographic operations.
 */

import type { CryptoInput, HashOutput } from '../types';

/**
 * Custom error classes for better error handling
 */
export class CryptographerError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'CryptographerError';
  }
}

export class ValidationError extends CryptographerError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class InvalidInputError extends CryptographerError {
  constructor(message: string) {
    super(message, 'INVALID_INPUT');
    this.name = 'InvalidInputError';
  }
}

export class InvalidKeyError extends CryptographerError {
  constructor(message: string) {
    super(message, 'INVALID_KEY');
    this.name = 'InvalidKeyError';
  }
}

export class InvalidParameterError extends CryptographerError {
  constructor(message: string) {
    super(message, 'INVALID_PARAMETER');
    this.name = 'InvalidParameterError';
  }
}

/**
 * Validates that input is a valid CryptoInput type
 */
export function validateCryptoInput(input: unknown, paramName = 'input'): asserts input is CryptoInput {
  if (input === null || input === undefined) {
    throw new InvalidInputError(`${paramName} cannot be null or undefined`);
  }

  if (typeof input === 'string') {
    return; // Valid
  }

  if (Buffer.isBuffer(input)) {
    return; // Valid
  }

  if (input instanceof Uint8Array) {
    return; // Valid
  }

  throw new InvalidInputError(
    `${paramName} must be a string, Buffer, or Uint8Array. Received: ${typeof input}`
  );
}

/**
 * Validates hash output format
 */
export function validateHashOutput(format: unknown): asserts format is HashOutput {
  const validFormats: HashOutput[] = ['hex', 'base64', 'binary', 'buffer'];
  
  if (!validFormats.includes(format as HashOutput)) {
    throw new InvalidParameterError(
      `Invalid output format. Must be one of: ${validFormats.join(', ')}. Received: ${format}`
    );
  }
}

/**
 * Validates AES key length
 */
export function validateAESKey(key: CryptoInput): Buffer {
  const keyBuffer = convertToBuffer(key);
  const validLengths = [16, 24, 32]; // AES-128, AES-192, AES-256
  
  if (!validLengths.includes(keyBuffer.length)) {
    throw new InvalidKeyError(
      `AES key must be 16, 24, or 32 bytes long. Received: ${keyBuffer.length} bytes`
    );
  }
  
  return keyBuffer;
}

/**
 * Validates AES IV length
 */
export function validateAESIV(iv: CryptoInput): Buffer {
  const ivBuffer = convertToBuffer(iv);
  
  if (ivBuffer.length !== 16) {
    throw new InvalidParameterError(
      `AES IV must be exactly 16 bytes long. Received: ${ivBuffer.length} bytes`
    );
  }
  
  return ivBuffer;
}

/**
 * Validates HMAC key
 */
export function validateHMACKey(key: CryptoInput): Buffer {
  if (key === null || key === undefined) {
    throw new InvalidKeyError('HMAC key is required and cannot be null or undefined');
  }

  const keyBuffer = convertToBuffer(key);
  
  if (keyBuffer.length === 0) {
    throw new InvalidKeyError('HMAC key cannot be empty');
  }

  // Warn about weak keys
  if (keyBuffer.length < 16) {
    console.warn('Warning: HMAC key is shorter than 16 bytes. Consider using a longer key for better security.');
  }
  
  return keyBuffer;
}

/**
 * Validates PBKDF2 parameters
 */
export function validatePBKDF2Options(options: {
  salt: CryptoInput;
  iterations?: number;
  keyLength?: number;
}): {
  salt: Buffer;
  iterations: number;
  keyLength: number;
} {
  // Validate salt
  const saltBuffer = convertToBuffer(options.salt);
  if (saltBuffer.length < 8) {
    throw new InvalidParameterError('PBKDF2 salt must be at least 8 bytes long');
  }

  // Validate iterations
  const iterations = options.iterations ?? 100000;
  if (iterations < 1000) {
    throw new InvalidParameterError(
      `PBKDF2 iterations must be at least 1000. Recommended: 100000+. Received: ${iterations}`
    );
  }

  if (iterations < 100000) {
    console.warn(`Warning: PBKDF2 iterations (${iterations}) is below recommended minimum of 100000`);
  }

  // Validate key length
  const keyLength = options.keyLength ?? 32;
  if (keyLength < 1 || keyLength > 128) {
    throw new InvalidParameterError('PBKDF2 key length must be between 1 and 128 bytes');
  }

  return {
    salt: saltBuffer,
    iterations,
    keyLength
  };
}

/**
 * Validates Argon2 parameters
 */
export function validateArgon2Options(options: {
  salt: CryptoInput;
  timeCost?: number;
  memoryCost?: number;
  parallelism?: number;
  keyLength?: number;
  variant?: 'argon2i' | 'argon2d' | 'argon2id';
}): {
  salt: Buffer;
  timeCost: number;
  memoryCost: number;
  parallelism: number;
  keyLength: number;
  variant: 'argon2i' | 'argon2d' | 'argon2id';
} {
  // Validate salt
  const saltBuffer = convertToBuffer(options.salt);
  if (saltBuffer.length < 8) {
    throw new InvalidParameterError('Argon2 salt must be at least 8 bytes long');
  }

  // Validate time cost
  const timeCost = options.timeCost ?? 3;
  if (timeCost < 1 || timeCost > 100) {
    throw new InvalidParameterError('Argon2 time cost must be between 1 and 100');
  }

  // Validate memory cost
  const memoryCost = options.memoryCost ?? 4096;
  if (memoryCost < 1024 || memoryCost > 1024 * 1024) {
    throw new InvalidParameterError('Argon2 memory cost must be between 1024 KB and 1048576 KB (1GB)');
  }

  // Validate parallelism
  const parallelism = options.parallelism ?? 1;
  if (parallelism < 1 || parallelism > 16) {
    throw new InvalidParameterError('Argon2 parallelism must be between 1 and 16');
  }

  // Validate key length
  const keyLength = options.keyLength ?? 32;
  if (keyLength < 4 || keyLength > 128) {
    throw new InvalidParameterError('Argon2 key length must be between 4 and 128 bytes');
  }

  // Validate variant
  const variant = options.variant ?? 'argon2id';
  const validVariants = ['argon2i', 'argon2d', 'argon2id'];
  if (!validVariants.includes(variant)) {
    throw new InvalidParameterError(
      `Argon2 variant must be one of: ${validVariants.join(', ')}. Received: ${variant}`
    );
  }

  return {
    salt: saltBuffer,
    timeCost,
    memoryCost,
    parallelism,
    keyLength,
    variant
  };
}

/**
 * Validates bcrypt rounds
 */
export function validateBcryptRounds(rounds?: number): number {
  const defaultRounds = 10;
  const actualRounds = rounds ?? defaultRounds;
  
  if (actualRounds < 4 || actualRounds > 31) {
    throw new InvalidParameterError('bcrypt rounds must be between 4 and 31');
  }

  if (actualRounds < 10) {
    console.warn(`Warning: bcrypt rounds (${actualRounds}) is below recommended minimum of 10`);
  }

  return actualRounds;
}

/**
 * Validates cipher mode
 */
export function validateCipherMode(mode: unknown): asserts mode is 'CBC' | 'ECB' | 'CTR' {
  const validModes = ['CBC', 'ECB', 'CTR'];
  
  if (!validModes.includes(mode as string)) {
    throw new InvalidParameterError(
      `Invalid cipher mode. Must be one of: ${validModes.join(', ')}. Received: ${mode}`
    );
  }
}

/**
 * Validates padding scheme
 */
export function validatePadding(padding: unknown): asserts padding is 'PKCS7' | 'NoPadding' | 'ZeroPadding' {
  const validPaddings = ['PKCS7', 'NoPadding', 'ZeroPadding'];
  
  if (!validPaddings.includes(padding as string)) {
    throw new InvalidParameterError(
      `Invalid padding scheme. Must be one of: ${validPaddings.join(', ')}. Received: ${padding}`
    );
  }
}

/**
 * Converts CryptoInput to Buffer
 */
export function convertToBuffer(input: CryptoInput): Buffer {
  validateCryptoInput(input);
  
  if (typeof input === 'string') {
    return Buffer.from(input, 'utf8');
  }
  
  if (Buffer.isBuffer(input)) {
    return input;
  }
  
  if (input instanceof Uint8Array) {
    return Buffer.from(input);
  }
  
  // This should never happen due to validateCryptoInput, but TypeScript doesn't know that
  throw new InvalidInputError('Unable to convert input to Buffer');
}

/**
 * Securely compares two buffers to prevent timing attacks
 */
export function timeSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

/**
 * Validates that data is not empty
 */
export function validateNotEmpty(data: CryptoInput, paramName = 'data'): void {
  validateCryptoInput(data, paramName);
  
  const buffer = convertToBuffer(data);
  if (buffer.length === 0) {
    throw new InvalidInputError(`${paramName} cannot be empty`);
  }
}

/**
 * Rate limiting helper for preventing DoS attacks
 */
export class RateLimiter {
  private readonly attempts = new Map<string, { count: number; resetTime: number }>();
  
  constructor(
    private readonly maxAttempts: number = 100,
    private readonly windowMs: number = 60000 // 1 minute
  ) {}

  /**
   * Checks if an operation is allowed for the given identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      // Reset or create new tracking
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }

  /**
   * Clears rate limiting for an identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Cleans up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, attempt] of this.attempts.entries()) {
      if (now > attempt.resetTime) {
        this.attempts.delete(identifier);
      }
    }
  }
}

/**
 * Default rate limiter instance
 */
export const defaultRateLimiter = new RateLimiter();

/**
 * Wrapper function to apply rate limiting to cryptographic operations
 */
export function withRateLimit<T extends unknown[], R>(
  fn: (...args: T) => R,
  identifier: string,
  rateLimiter: RateLimiter = defaultRateLimiter
): (...args: T) => R {
  return (...args: T): R => {
    if (!rateLimiter.isAllowed(identifier)) {
      throw new CryptographerError(
        'Rate limit exceeded. Too many cryptographic operations in a short time.',
        'RATE_LIMIT_EXCEEDED'
      );
    }
    
    return fn(...args);
  };
}