/**
 * HMAC (Hash-based Message Authentication Code) module
 */

import { CryptoInput, HMACOptions, HashOutput } from '../types';

/**
 * HMAC implementation
 */
class HMAC {
  private wasmModule: any;
  private key: Uint8Array;
  private algorithm: string;

  constructor(wasmModule: any, key: CryptoInput, algorithm: string) {
    this.wasmModule = wasmModule;
    this.key = this.toBuffer(key);
    this.algorithm = algorithm;
  }

  /**
   * Generate HMAC for the given data
   */
  digest(data: CryptoInput, format: HashOutput = 'hex'): string | Buffer {
    const dataBuffer = this.toBuffer(data);
    
    // Call the appropriate WASM function based on algorithm
    let result: Uint8Array;
    switch (this.algorithm) {
      case 'sha1':
        result = this.wasmModule.hmac_sha1(dataBuffer, this.key);
        break;
      case 'sha256':
        result = this.wasmModule.hmac_sha256(dataBuffer, this.key);
        break;
      case 'sha512':
        result = this.wasmModule.hmac_sha512(dataBuffer, this.key);
        break;
      case 'md5':
        result = this.wasmModule.hmac_md5(dataBuffer, this.key);
        break;
      default:
        throw new Error(`Unsupported HMAC algorithm: ${this.algorithm}`);
    }
    
    return this.formatOutput(result, format);
  }

  private toBuffer(input: CryptoInput): Uint8Array {
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

  private formatOutput(data: Uint8Array, format: HashOutput): string | Buffer {
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
 * Create HMAC function
 */
function createHMACFunction(algorithm: string) {
  let wasmModule: any;

  return function(data: CryptoInput, options: HMACOptions): string | Buffer {
    if (!wasmModule) {
      wasmModule = require('../../packages/hmac/hmac_wasm');
    }
    
    const hmac = new HMAC(wasmModule, options.key, algorithm);
    return hmac.digest(data, options.outputFormat || 'hex');
  };
}

// Export HMAC functions for different algorithms
export const hmacSHA1 = createHMACFunction('sha1');
export const hmacSHA256 = createHMACFunction('sha256');
export const hmacSHA512 = createHMACFunction('sha512');
export const hmacMD5 = createHMACFunction('md5');

// Export all HMAC functions as an object
export const hmac = {
  sha1: hmacSHA1,
  sha256: hmacSHA256,
  sha512: hmacSHA512,
  md5: hmacMD5
};