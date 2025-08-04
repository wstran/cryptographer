"use strict";
/**
 * Hash algorithms module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.ripemd160 = exports.whirlpool = exports.blake3 = exports.blake2s = exports.blake2b = exports.md5 = exports.md4 = exports.sha3_512 = exports.sha3_256 = exports.sha512 = exports.sha256 = exports.sha1 = void 0;
/**
 * Base class for hash algorithm wrappers
 */
class BaseHash {
    constructor(wasmModule) {
        this.wasmModule = wasmModule;
        this.hashInstance = new wasmModule.Hasher();
    }
    update(data) {
        const buffer = this.toBuffer(data);
        this.hashInstance.update(buffer);
        return this;
    }
    digest(format = 'hex') {
        const result = this.hashInstance.digest();
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
function createHashFunction(wasmPath, HashClass) {
    let wasmModule;
    const hashFunction = function (input, options) {
        if (!wasmModule) {
            wasmModule = require(wasmPath);
        }
        const hash = new HashClass(wasmModule);
        hash.update(input);
        return hash.digest(options?.outputFormat || 'hex');
    };
    hashFunction.create = function () {
        if (!wasmModule) {
            wasmModule = require(wasmPath);
        }
        return new HashClass(wasmModule);
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
exports.sha1 = createHashFunction('../../packages/sha/sha1_wasm', SHA1Hash);
exports.sha256 = createHashFunction('../../packages/sha/sha2_wasm', SHA256Hash);
exports.sha512 = createHashFunction('../../packages/sha/sha2_wasm', SHA512Hash);
exports.sha3_256 = createHashFunction('../../packages/sha/sha3_wasm', SHA3_256Hash);
exports.sha3_512 = createHashFunction('../../packages/sha/sha3_wasm', SHA3_512Hash);
exports.md4 = createHashFunction('../../packages/sha/md4_wasm', MD4Hash);
exports.md5 = createHashFunction('../../packages/sha/md5_wasm', MD5Hash);
exports.blake2b = createHashFunction('../../packages/sha/blake2_wasm', Blake2bHash);
exports.blake2s = createHashFunction('../../packages/sha/blake2_wasm', Blake2sHash);
exports.blake3 = createHashFunction('../../packages/sha/blake3_wasm', Blake3Hash);
exports.whirlpool = createHashFunction('../../packages/sha/whirlpool_wasm', WhirlpoolHash);
exports.ripemd160 = createHashFunction('../../packages/sha/ripemd160_wasm', RIPEMD160Hash);
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
    ripemd160: exports.ripemd160
};
//# sourceMappingURL=index.js.map