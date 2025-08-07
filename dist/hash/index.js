"use strict";
/**
 * Hash algorithms module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.ripemd160 = exports.whirlpool = exports.blake3 = exports.blake2s = exports.blake2b = exports.md5 = exports.md4 = exports.sha3_512 = exports.sha3_256 = exports.sha512 = exports.sha256 = exports.sha1 = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
/**
 * Base class for hash algorithm wrappers
 */
class BaseHash {
    constructor(wasmModule, streamingOptions) {
        Object.defineProperty(this, "wasmModule", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hashInstance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streamingOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.wasmModule = wasmModule;
        this.streamingOptions = streamingOptions;
        const ctor = wasmModule.StreamingHasher ||
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
        // Provide default algo when module expects options (e.g., sha2_wasm)
        try {
            const opts = this.streamingOptions ?? { algo: 'sha256' };
            this.hashInstance = new ctor(opts);
        }
        catch (_e) {
            this.hashInstance = new ctor({});
        }
    }
    update(data) {
        const buffer = this.toBuffer(data);
        this.hashInstance.update(buffer);
        return this;
    }
    digest(format = 'hex') {
        const result = this.hashInstance.finalize();
        return this.formatOutput(result, format);
    }
    reset() {
        this.hashInstance.reset();
        return this;
    }
    toBuffer(input) {
        if (typeof input === 'string') {
            return Buffer.from(input, 'utf8');
        }
        else if (Buffer.isBuffer(input)) {
            return new Uint8Array(input);
        }
        else if (input instanceof Uint8Array) {
            return input;
        }
        else {
            throw new TypeError('Input must be string, Buffer, or Uint8Array');
        }
    }
    formatOutput(data, format) {
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
function createHashFunction(wasmPathSegments, HashClass, runtimeOptions) {
    let wasmModule;
    const hashFunction = function (input, options) {
        if (!wasmModule) {
            const resolvedPath = path_1.default.join(__dirname, '..', ...wasmPathSegments);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            wasmModule = require(resolvedPath);
        }
        const hash = new HashClass(wasmModule, runtimeOptions);
        hash.update(input);
        return hash.digest(options?.outputFormat || 'hex');
    };
    hashFunction.create = function () {
        if (!wasmModule) {
            const resolvedPath = path_1.default.join(__dirname, '..', ...wasmPathSegments);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            wasmModule = require(resolvedPath);
        }
        return new HashClass(wasmModule, runtimeOptions);
    };
    return hashFunction;
}
// SHA family
class SHA1Hash extends BaseHash {
}
class SHA256Hash extends BaseHash {
}
class SHA512Hash extends BaseHash {
}
class SHA3_256Hash extends BaseHash {
}
class SHA3_512Hash extends BaseHash {
}
// MD family
class MD4Hash extends BaseHash {
}
class MD5Hash extends BaseHash {
}
// BLAKE family
class Blake2bHash extends BaseHash {
}
class Blake2sHash extends BaseHash {
}
class Blake3Hash extends BaseHash {
}
// Others
class WhirlpoolHash extends BaseHash {
}
class RIPEMD160Hash extends BaseHash {
}
// Export hash functions
exports.sha1 = createHashFunction(['sha', 'sha1_wasm', 'sha1_wasm.js'], SHA1Hash);
exports.sha256 = createHashFunction(['sha', 'sha2_wasm', 'sha2_wasm.js'], SHA256Hash, { algo: 'sha256' });
exports.sha512 = createHashFunction(['sha', 'sha2_wasm', 'sha2_wasm.js'], SHA512Hash, { algo: 'sha512' });
exports.sha3_256 = createHashFunction(['sha', 'sha3_wasm', 'sha3_wasm.js'], SHA3_256Hash, { algo: 'sha3_256' });
exports.sha3_512 = createHashFunction(['sha', 'sha3_wasm', 'sha3_wasm.js'], SHA3_512Hash, { algo: 'sha3_512' });
exports.md4 = createHashFunction(['sha', 'md4_wasm', 'md4_wasm.js'], MD4Hash, { algo: 'md4' });
exports.md5 = createHashFunction(['sha', 'md5_wasm', 'md5_wasm.js'], MD5Hash, { algo: 'md5' });
exports.blake2b = createHashFunction(['sha', 'blake2_wasm', 'blake2_wasm.js'], Blake2bHash, { algo: 'blake2b' });
exports.blake2s = createHashFunction(['sha', 'blake2_wasm', 'blake2_wasm.js'], Blake2sHash, { algo: 'blake2s' });
exports.blake3 = createHashFunction(['sha', 'blake3_wasm', 'blake3_wasm.js'], Blake3Hash);
exports.whirlpool = createHashFunction(['sha', 'whirlpool_wasm', 'whirlpool_wasm.js'], WhirlpoolHash, { algo: 'whirlpool' });
exports.ripemd160 = createHashFunction(['sha', 'ripemd160_wasm', 'ripemd160_wasm.js'], RIPEMD160Hash, { algo: 'ripemd160' });
// Export all hash functions as an object
exports.hash = {
    sha1: exports.sha1,
    sha256: exports.sha256,
    sha512: exports.sha512,
    sha3_256: exports.sha3_256,
    sha3_512: exports.sha3_512,
    md4: exports.md4,
    md5: exports.md5,
    blake2b: exports.blake2b,
    blake2s: exports.blake2s,
    blake3: exports.blake3,
    whirlpool: exports.whirlpool,
    ripemd160: exports.ripemd160,
};
//# sourceMappingURL=index.js.map