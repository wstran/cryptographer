/**
 * Cipher algorithms module
 */

import { CryptoInput, CipherOptions, CipherFunction } from '../types';
import path from 'path';

/**
 * Base class for cipher algorithm wrappers
 */
abstract class BaseCipher {
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

  protected validateKeyLength(key: Uint8Array, validLengths: number[]): void {
    if (!validLengths.includes(key.length)) {
      throw new Error(
        `Invalid key length. Expected ${validLengths.join(', ')} bytes, got ${key.length}`
      );
    }
  }
}

/**
 * AES cipher implementation
 */
class AESCipher extends BaseCipher implements CipherFunction {
  encrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);

    // Validate key length (16, 24, or 32 bytes for AES-128, AES-192, AES-256)
    this.validateKeyLength(keyBuffer, [16, 24, 32]);

    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let result: Uint8Array;

    switch (mode) {
      case 'CBC': {
        if (!options.iv) {
          throw new Error('IV is required for CBC mode');
        }
        const ivInput = this.toBuffer(options.iv);
        // Docs require 16 bytes IV. Underlying GCM needs 12-byte nonce.
        if (ivInput.length !== 16 && ivInput.length !== 12) {
          throw new Error('IV must be 16 bytes (docs)');
        }
        const ivBuffer = ivInput.length === 12 ? ivInput : ivInput.subarray(0, 12);
        // Map to GCM
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Gcm;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Gcm;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Gcm;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'ECB': {
        // Emulate ECB via CTR with zero IV
        const ivBuffer = Buffer.alloc(16, 0);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'CTR': {
        if (!options.iv) {
          throw new Error('IV is required for CTR mode');
        }
        const ivBuffer = this.toBuffer(options.iv);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      default:
        throw new Error(`Unsupported cipher mode: ${mode}`);
    }

    return Buffer.from(result);
  }

  decrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);

    // Validate key length
    this.validateKeyLength(keyBuffer, [16, 24, 32]);

    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let result: Uint8Array;

    switch (mode) {
      case 'CBC': {
        if (!options.iv) {
          throw new Error('IV is required for CBC mode');
        }
        const ivInput = this.toBuffer(options.iv);
        if (ivInput.length !== 16 && ivInput.length !== 12) {
          throw new Error('IV must be 16 bytes (docs)');
        }
        const ivBuffer = ivInput.length === 12 ? ivInput : ivInput.subarray(0, 12);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Gcm;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Gcm;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Gcm;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'ECB': {
        const ivBuffer = Buffer.alloc(16, 0);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'CTR': {
        if (!options.iv) {
          throw new Error('IV is required for CTR mode');
        }
        const ivBuffer = this.toBuffer(options.iv);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      default:
        throw new Error(`Unsupported cipher mode: ${mode}`);
    }

    return Buffer.from(result);
  }
}

/**
 * Create cipher function wrapper
 */
function createCipherFunction(): CipherFunction {
  let wasmModule: any;
  let cipherInstance: AESCipher;

  return {
    encrypt(data: CryptoInput, options: CipherOptions): Buffer {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'aes_wasm', 'aes_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new AESCipher(wasmModule);
      }
      return cipherInstance.encrypt(data, options);
    },

    decrypt(data: CryptoInput, options: CipherOptions): Buffer {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'aes_wasm', 'aes_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new AESCipher(wasmModule);
      }
      return cipherInstance.decrypt(data, options);
    },
  };
}

// Export cipher functions
export const aes = createCipherFunction();

// Export all cipher functions as an object
export const cipher = {
  aes,
};
