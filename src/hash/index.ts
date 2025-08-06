/**
 * Hash algorithms module
 */

import { CryptoInput, HashOptions, HashFunction, HashInstance, HashOutput } from '../types';

/**
 * Base class for hash algorithm wrappers
 */
abstract class BaseHash implements HashInstance {
  protected wasmModule: any;
  protected hashInstance: any;

  constructor(wasmModule: any) {
    this.wasmModule = wasmModule;
    this.hashInstance = new wasmModule.StreamingHasher({});
  }

  update(data: CryptoInput): this {
    const buffer = this.toBuffer(data);
    this.hashInstance.update(buffer);
    return this;
  }

  digest(format: HashOutput = 'hex'): string | Buffer {
    const result = this.hashInstance.finalize();
    return this.formatOutput(result, format);
  }

  reset(): this {
    this.hashInstance.reset();
    return this;
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
 * Create a hash function wrapper
 */
function createHashFunction<T extends BaseHash>(
  wasmPath: string,
  HashClass: new (wasmModule: any) => T
): HashFunction {
  let wasmModule: any;

  const hashFunction = function (input: CryptoInput, options?: HashOptions): string | Buffer {
    if (!wasmModule) {
      wasmModule = require(wasmPath);
    }

    const hash = new HashClass(wasmModule);
    hash.update(input);
    return hash.digest(options?.outputFormat || 'hex');
  } as HashFunction;

  hashFunction.create = function (): HashInstance {
    if (!wasmModule) {
      wasmModule = require(wasmPath);
    }
    return new HashClass(wasmModule);
  };

  return hashFunction;
}

// SHA family
class SHA1Hash extends BaseHash {}
class SHA256Hash extends BaseHash {}
class SHA512Hash extends BaseHash {}
class SHA3_256Hash extends BaseHash {}
class SHA3_512Hash extends BaseHash {}

// MD family
class MD4Hash extends BaseHash {}
class MD5Hash extends BaseHash {}

// BLAKE family
class Blake2bHash extends BaseHash {}
class Blake2sHash extends BaseHash {}
class Blake3Hash extends BaseHash {}

// Others
class WhirlpoolHash extends BaseHash {}
class RIPEMD160Hash extends BaseHash {}

// Export hash functions
export const sha1 = createHashFunction('../../packages/sha/sha1_wasm', SHA1Hash);
export const sha256 = createHashFunction('../../packages/sha/sha2_wasm', SHA256Hash);
export const sha512 = createHashFunction('../../packages/sha/sha2_wasm', SHA512Hash);
export const sha3_256 = createHashFunction('../../packages/sha/sha3_wasm', SHA3_256Hash);
export const sha3_512 = createHashFunction('../../packages/sha/sha3_wasm', SHA3_512Hash);
export const md4 = createHashFunction('../../packages/sha/md4_wasm', MD4Hash);
export const md5 = createHashFunction('../../packages/sha/md5_wasm', MD5Hash);
export const blake2b = createHashFunction('../../packages/sha/blake2_wasm', Blake2bHash);
export const blake2s = createHashFunction('../../packages/sha/blake2_wasm', Blake2sHash);
export const blake3 = createHashFunction('../../packages/sha/blake3_wasm', Blake3Hash);
export const whirlpool = createHashFunction('../../packages/sha/whirlpool_wasm', WhirlpoolHash);
export const ripemd160 = createHashFunction('../../packages/sha/ripemd160_wasm', RIPEMD160Hash);

// Export all hash functions as an object
export const hash = {
  sha1,
  sha256,
  sha512,
  sha3_256,
  sha3_512,
  md4,
  md5,
  blake2b,
  blake2s,
  blake3,
  whirlpool,
  ripemd160,
};
