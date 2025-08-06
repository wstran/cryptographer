/**
 * Key Derivation Functions (KDF) module
 */

import { CryptoInput, KDFOptions, Argon2Options, BcryptOptions, HashOutput } from '../types';

/**
 * Base class for KDF wrappers
 */
abstract class BaseKDF {
  protected wasmModule: any;

  constructor(wasmModule: any) {
    this.wasmModule = wasmModule;
  }

  protected toBuffer(input: CryptoInput): Uint8Array {
    if (typeof input === 'string') {
      return Buffer.from(input, 'utf8');
    } else if (Buffer.isBuffer(input)) {
      return new Uint8Array(input);
    } else if (input instanceof Uint8Array) {
      return input;
    } else {
      throw new TypeError('Input must be string, Buffer, or Uint8Array');
    }
  }

  protected formatOutput(data: Uint8Array, format: HashOutput): string | Buffer {
    switch (format) {
      case 'hex':
        return Buffer.from(data).toString('hex');
      case 'base64':
        return Buffer.from(data).toString('base64');
      case 'binary':
        return Buffer.from(data).toString('binary');
      case 'buffer':
        return Buffer.from(data);
      default:
        throw new Error(`Unknown output format: ${format}`);
    }
  }
}

/**
 * PBKDF2 implementation
 */
class PBKDF2 extends BaseKDF {
  derive(password: CryptoInput, options: KDFOptions): string | Buffer {
    const passwordBuffer = this.toBuffer(password);
    const saltBuffer = this.toBuffer(options.salt);
    const iterations = options.iterations || 100000;
    const keyLength = options.keyLength || 32;

    const result = this.wasmModule.pbkdf2_sha256(passwordBuffer, saltBuffer, iterations, keyLength);

    return this.formatOutput(result, options.outputFormat || 'hex');
  }
}

/**
 * Argon2 implementation
 */
class Argon2 extends BaseKDF {
  derive(password: CryptoInput, options: Argon2Options): string | Buffer {
    const passwordBuffer = this.toBuffer(password);
    const saltBuffer = this.toBuffer(options.salt);

    const config = {
      timeCost: options.timeCost || 3,
      memoryCost: options.memoryCost || 4096,
      parallelism: options.parallelism || 1,
      keyLength: options.keyLength || 32,
      variant: options.variant || 'argon2id',
    };

    let result: Uint8Array;
    switch (config.variant) {
      case 'argon2i':
        result = this.wasmModule.argon2i(
          passwordBuffer,
          saltBuffer,
          config.timeCost,
          config.memoryCost,
          config.parallelism,
          config.keyLength
        );
        break;
      case 'argon2d':
        result = this.wasmModule.argon2d(
          passwordBuffer,
          saltBuffer,
          config.timeCost,
          config.memoryCost,
          config.parallelism,
          config.keyLength
        );
        break;
      case 'argon2id':
        result = this.wasmModule.argon2id(
          passwordBuffer,
          saltBuffer,
          config.timeCost,
          config.memoryCost,
          config.parallelism,
          config.keyLength
        );
        break;
      default:
        throw new Error(`Unknown Argon2 variant: ${config.variant}`);
    }

    return this.formatOutput(result, options.outputFormat || 'hex');
  }
}

/**
 * Bcrypt implementation
 */
class Bcrypt extends BaseKDF {
  hash(password: CryptoInput, options?: BcryptOptions): string {
    const passwordBuffer = this.toBuffer(password);
    const rounds = options?.rounds || 10;

    if (rounds < 4 || rounds > 31) {
      throw new Error('Bcrypt rounds must be between 4 and 31');
    }

    // Generate salt and hash
    const result = this.wasmModule.bcrypt_hash(passwordBuffer, rounds);
    return Buffer.from(result).toString('utf8');
  }

  verify(password: CryptoInput, hash: string): boolean {
    const passwordBuffer = this.toBuffer(password);
    const hashBuffer = Buffer.from(hash, 'utf8');

    return this.wasmModule.bcrypt_verify(passwordBuffer, hashBuffer);
  }
}

/**
 * Create PBKDF2 function
 */
export const pbkdf2 = (function () {
  let wasmModule: any;

  return function (password: CryptoInput, options: KDFOptions): string | Buffer {
    if (!wasmModule) {
              wasmModule = require('../wasm_packages/pha/pbkdf2_wasm');
    }
    const pbkdf2Instance = new PBKDF2(wasmModule);
    return pbkdf2Instance.derive(password, options);
  };
})();

/**
 * Create Argon2 function
 */
export const argon2 = (function () {
  let wasmModule: any;

  return function (password: CryptoInput, options: Argon2Options): string | Buffer {
    if (!wasmModule) {
              wasmModule = require('../wasm_packages/pha/argon2_wasm');
    }
    const argon2Instance = new Argon2(wasmModule);
    return argon2Instance.derive(password, options);
  };
})();

/**
 * Create Bcrypt functions
 */
export const bcrypt = (function () {
  let wasmModule: any;
  let bcryptInstance: Bcrypt;

  return {
    hash(password: CryptoInput, options?: BcryptOptions): string {
      if (!wasmModule) {
        wasmModule = require('../wasm_packages/pha/bcrypt_wasm');
        bcryptInstance = new Bcrypt(wasmModule);
      }
      return bcryptInstance.hash(password, options);
    },

    verify(password: CryptoInput, hash: string): boolean {
      if (!wasmModule) {
        wasmModule = require('../wasm_packages/pha/bcrypt_wasm');
        bcryptInstance = new Bcrypt(wasmModule);
      }
      return bcryptInstance.verify(password, hash);
    },
  };
})();

// Export all KDF functions as an object
export const kdf = {
  pbkdf2,
  argon2,
  bcrypt,
};
