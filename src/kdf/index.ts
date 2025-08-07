/**
 * Key Derivation Functions (KDF) module
 */

import { CryptoInput, KDFOptions, Argon2Options, BcryptOptions, HashOutput } from '../types';
import path from 'path';

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
    // PBKDF2 wasm expects base64 with proper padding
    const saltBase64 = Buffer.from(this.toBuffer(options.salt)).toString('base64');
    const iterations = options.iterations || 100000;
    const keyLength = options.keyLength || 32;

    const encoded = this.wasmModule.hash_password(passwordBuffer, {
      salt: saltBase64,
      iterations,
      key_length: keyLength,
    });

    const outBuffer = Buffer.from(encoded, 'base64');
    return this.formatOutput(outBuffer, options.outputFormat || 'hex');
  }
}

/**
 * Argon2 implementation
 */
class Argon2 extends BaseKDF {
  derive(password: CryptoInput, options: Argon2Options): string | Buffer {
    const passwordBuffer = this.toBuffer(password);
    const saltBase64 = Buffer.from(this.toBuffer(options.salt)).toString('base64');
    // Argon2 crate expects salt without '=' padding
    const encoded = this.wasmModule.hash_password(passwordBuffer, { salt: saltBase64.replace(/=+$/g, '') });
    // For Argon2, return the PHC string (utf8) by default; if buffer requested, return bytes
    if ((options.outputFormat || 'hex') === 'buffer') {
      return Buffer.from(encoded, 'utf8');
    }
    return encoded;
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
    return this.wasmModule.hash_password(passwordBuffer, { rounds });
  }

  verify(password: CryptoInput, hash: string): boolean {
    const passwordBuffer = this.toBuffer(password);
    return this.wasmModule.verify_password(passwordBuffer, hash);
  }
}

/**
 * Create PBKDF2 function
 */
export const pbkdf2 = (function () {
  let wasmModule: any;

  return function (password: CryptoInput, options: KDFOptions): string | Buffer {
    if (!wasmModule) {
      const resolvedPath = path.join(__dirname, '..', 'pha', 'pbkdf2_wasm', 'pbkdf2_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(resolvedPath);
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
      const resolvedPath = path.join(__dirname, '..', 'pha', 'argon2_wasm', 'argon2_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(resolvedPath);
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
        const resolvedPath = path.join(__dirname, '..', 'pha', 'bcrypt_wasm', 'bcrypt_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        bcryptInstance = new Bcrypt(wasmModule);
      }
      return bcryptInstance.hash(password, options);
    },

    verify(password: CryptoInput, hash: string): boolean {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, '..', 'pha', 'bcrypt_wasm', 'bcrypt_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
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
