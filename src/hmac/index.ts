/**
 * HMAC (Hash-based Message Authentication Code) module
 */

import { CryptoInput, HMACOptions, HashOutput, HmacInstance } from '../types';
import path from 'path';

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
    const Algo = this.wasmModule.HashAlgorithm;
    switch (this.algorithm) {
      case 'sha1':
        result = this.wasmModule.hmac(this.key, dataBuffer, Algo.Sha1);
        break;
      case 'sha256':
        result = this.wasmModule.hmac(this.key, dataBuffer, Algo.Sha256);
        break;
      case 'sha512':
        result = this.wasmModule.hmac(this.key, dataBuffer, Algo.Sha512);
        break;
      case 'md5':
        result = this.wasmModule.hmac(this.key, dataBuffer, Algo.Md5);
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
  const createImmediate = function (data: CryptoInput, options: HMACOptions): string | Buffer {
    if (!wasmModule) {
      const resolvedPath = path.join(__dirname, '..', 'hmac', 'hmac_wasm', 'hmac_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(resolvedPath);
    }
    const hmac = new HMAC(wasmModule, options.key, algorithm);
    return hmac.digest(data, options.outputFormat || 'hex');
  } as ((data: CryptoInput, options: HMACOptions) => string | Buffer) & {
    create: (options: { key: CryptoInput; outputFormat?: HashOutput }) => HmacInstance;
  };

  createImmediate.create = (options: { key: CryptoInput; outputFormat?: HashOutput }): HmacInstance => {
    if (!wasmModule) {
      const resolvedPath = path.join(__dirname, '..', 'hmac', 'hmac_wasm', 'hmac_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(resolvedPath);
    }
    const Algo = wasmModule.HashAlgorithm;
    const algoEnum =
      algorithm === 'sha1' ? Algo.Sha1 :
      algorithm === 'sha256' ? Algo.Sha256 :
      algorithm === 'sha512' ? Algo.Sha512 :
      algorithm === 'md5' ? Algo.Md5 : undefined;
    if (!algoEnum) throw new Error(`Unsupported HMAC algorithm: ${algorithm}`);

    let stream = new wasmModule.StreamingHmac(new HMAC(wasmModule, options.key, algorithm)['toBuffer'](options.key), algoEnum);

    const format = options.outputFormat || 'hex';
    const instance: HmacInstance = {
      update(data: CryptoInput) {
        const buf = new HMAC(wasmModule, options.key, algorithm)['toBuffer'](data);
        // wasm method throws on error; surface as JS error
        stream.update(buf);
        return this;
      },
      digest(outFormat?: HashOutput) {
        const out: Uint8Array = stream.finalize();
        const chosen = outFormat || format;
        switch (chosen) {
          case 'hex':
            return Buffer.from(out).toString('hex');
          case 'base64':
            return Buffer.from(out).toString('base64');
          case 'binary':
            return Buffer.from(out).toString('binary');
          case 'buffer':
            return Buffer.from(out);
          default:
            throw new Error(`Unknown output format: ${chosen}`);
        }
      },
      reset() {
        // Recreate stream to reset
        stream = new wasmModule.StreamingHmac(new HMAC(wasmModule, options.key, algorithm)['toBuffer'](options.key), algoEnum);
        return this;
      },
    };
    return instance;
  };

  return createImmediate;
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
  md5: hmacMD5,
};
