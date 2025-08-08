/**
 * Hash algorithms module
 */

import {
  CryptoInput,
  HashOptions,
  HashFunction,
  HashInstance,
  HashOutput,
  Blake3Options,
} from '../types';
import path from 'path';

/**
 * Base class for hash algorithm wrappers
 */
abstract class BaseHash implements HashInstance {
  protected wasmModule: any;
  protected hashInstance: any;
  protected streamingOptions?: any;

  constructor(wasmModule: any, streamingOptions?: any) {
    this.wasmModule = wasmModule;
    this.streamingOptions = streamingOptions;
    const ctor =
      wasmModule.StreamingHasher ||
      wasmModule.StreamingSha1 ||
      wasmModule.StreamingSha2 ||
      wasmModule.StreamingSha3 ||
      wasmModule.StreamingMd4 ||
      wasmModule.StreamingMd5 ||
      wasmModule.StreamingRipemd160 ||
      wasmModule.StreamingWhirlpool;
    if (!ctor) {
      throw new Error('WASM module does not export a streaming hasher');
    }
    // Try with provided options, then without args, then with empty object
    // to accommodate different wasm constructors across algorithms
    const candidateOptions = this.streamingOptions ?? { algo: 'sha256' };
    try {
      // Some constructors accept an options object
      this.hashInstance = new ctor(candidateOptions);
    } catch (_e1) {
      try {
        // Some constructors accept no arguments
        this.hashInstance = new ctor();
      } catch (_e2) {
        // Fallback to empty object
        this.hashInstance = new ctor({});
      }
    }
  }

  update(data: CryptoInput): this {
    const buffer = this.toBuffer(data);
    this.hashInstance.update(buffer);
    return this;
  }

  digest(format: HashOutput = 'hex'): string | Buffer {
    // Support extendable-output for algorithms that expose finalize_xof(length)
    const length = this.streamingOptions?.hash_length ?? this.streamingOptions?.hashLength;
    if (typeof length === 'number' && typeof this.hashInstance.finalize_xof === 'function') {
      const result = this.hashInstance.finalize_xof(length);
      return this.formatOutput(result, format);
    }
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
  wasmPathSegments: string[],
  HashClass: new (wasmModule: any, streamingOptions?: any) => T,
  runtimeOptions?: any
): HashFunction {
  let wasmModule: any;

  function toUint8(input: CryptoInput): Uint8Array {
    if (typeof input === 'string') return new Uint8Array(Buffer.from(input, 'utf8'));
    if (Buffer.isBuffer(input)) return new Uint8Array(input);
    if (input instanceof Uint8Array) return input;
    throw new TypeError('Input must be string, Buffer, or Uint8Array');
  }

  function formatOutput(data: Uint8Array, format: HashOutput): string | Buffer {
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

  function normalizeOptions(
    options?: HashOptions | Record<string, unknown>
  ): Record<string, unknown> {
    if (!options) return { ...runtimeOptions };
    const { outputFormat, ...rest } = options as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...(runtimeOptions || {}), ...rest };

    if (merged.deriveKey && !merged.derive_key) {
      merged.derive_key = merged.deriveKey;
      delete merged.deriveKey;
    }
    const hl = (merged as any).hashLength ?? (merged as any).hash_length;
    if (typeof hl === 'number') {
      (merged as any).hash_length = hl;
      delete (merged as any).hashLength;
    }
    if (merged.keyed !== undefined) {
      const k = merged.keyed as CryptoInput;
      if (typeof k === 'string') merged.keyed = Buffer.from(k, 'utf8');
      if (Buffer.isBuffer(k)) merged.keyed = new Uint8Array(k);
      if (k instanceof Uint8Array) merged.keyed = k;
    }
    return merged;
  }

  const hashFunction = function (input: CryptoInput, options?: HashOptions): string | Buffer {
    if (!wasmModule) {
      const resolvedPath = path.join(__dirname, '..', ...wasmPathSegments);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(resolvedPath);
    }

    const outputFormat = options?.outputFormat || 'hex';
    const normalizedOptions = normalizeOptions(options);

    // Prefer direct wasm hash when it accepts options
    if (wasmModule && typeof wasmModule.hash === 'function') {
      const wantsOptions = wasmModule.hash.length >= 2;
      const hasAlgoOptions = Object.keys(normalizedOptions || {}).length > 0;
      if (wantsOptions && hasAlgoOptions) {
        const buf = toUint8(input);
        const result: Uint8Array = wasmModule.hash(buf, normalizedOptions);
        return formatOutput(result, outputFormat);
      }
    }

    const hash = new HashClass(wasmModule, normalizedOptions);
    hash.update(input);
    return hash.digest(outputFormat);
  } as HashFunction;

  hashFunction.create = function (options?: HashOptions): HashInstance {
    if (!wasmModule) {
      const resolvedPath = path.join(__dirname, '..', ...wasmPathSegments);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      wasmModule = require(resolvedPath);
    }
    const normalizedOptions = normalizeOptions(options);
    return new HashClass(wasmModule, normalizedOptions);
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
export const sha1 = createHashFunction(['sha', 'sha1_wasm', 'sha1_wasm.js'], SHA1Hash);
export const sha256 = createHashFunction(['sha', 'sha2_wasm', 'sha2_wasm.js'], SHA256Hash, {
  algo: 'sha256',
});
export const sha512 = createHashFunction(['sha', 'sha2_wasm', 'sha2_wasm.js'], SHA512Hash, {
  algo: 'sha512',
});
export const sha3_256 = createHashFunction(['sha', 'sha3_wasm', 'sha3_wasm.js'], SHA3_256Hash, {
  algo: 'sha3_256',
});
export const sha3_512 = createHashFunction(['sha', 'sha3_wasm', 'sha3_wasm.js'], SHA3_512Hash, {
  algo: 'sha3_512',
});
export const md4 = createHashFunction(['sha', 'md4_wasm', 'md4_wasm.js'], MD4Hash, { algo: 'md4' });
export const md5 = createHashFunction(['sha', 'md5_wasm', 'md5_wasm.js'], MD5Hash, { algo: 'md5' });
export const blake2b = createHashFunction(['sha', 'blake2_wasm', 'blake2_wasm.js'], Blake2bHash, {
  algo: 'blake2b',
});
export const blake2s = createHashFunction(['sha', 'blake2_wasm', 'blake2_wasm.js'], Blake2sHash, {
  algo: 'blake2s',
});
export const blake3 = createHashFunction(
  ['sha', 'blake3_wasm', 'blake3_wasm.js'],
  Blake3Hash
) as unknown as {
  (input: CryptoInput, options?: Blake3Options): string | Buffer;
  create(options?: Blake3Options): HashInstance;
};
export const whirlpool = createHashFunction(
  ['sha', 'whirlpool_wasm', 'whirlpool_wasm.js'],
  WhirlpoolHash,
  { algo: 'whirlpool' }
);
export const ripemd160 = createHashFunction(
  ['sha', 'ripemd160_wasm', 'ripemd160_wasm.js'],
  RIPEMD160Hash,
  { algo: 'ripemd160' }
);

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
