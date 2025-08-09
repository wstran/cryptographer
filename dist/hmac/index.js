"use strict";
/**
 * HMAC (Hash-based Message Authentication Code) module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmac = exports.hmacMD5 = exports.hmacSHA512 = exports.hmacSHA256 = exports.hmacSHA1 = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
/**
 * HMAC implementation
 */
class HMAC {
    constructor(wasmModule, key, algorithm) {
        Object.defineProperty(this, "wasmModule", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "algorithm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.wasmModule = wasmModule;
        this.key = this.toBuffer(key);
        this.algorithm = algorithm;
    }
    /**
     * Generate HMAC for the given data
     */
    digest(data, format = 'hex') {
        const dataBuffer = this.toBuffer(data);
        // Call the appropriate WASM function based on algorithm
        let result;
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
 * Create HMAC function
 */
function createHMACFunction(algorithm) {
    let wasmModule;
    const createImmediate = function (data, options) {
        if (!wasmModule) {
            const resolvedPath = path_1.default.join(__dirname, '..', 'hmac', 'hmac_wasm', 'hmac_wasm.js');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            wasmModule = require(resolvedPath);
        }
        const hmac = new HMAC(wasmModule, options.key, algorithm);
        return hmac.digest(data, options.outputFormat || 'hex');
    };
    createImmediate.create = (options) => {
        if (!wasmModule) {
            const resolvedPath = path_1.default.join(__dirname, '..', 'hmac', 'hmac_wasm', 'hmac_wasm.js');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            wasmModule = require(resolvedPath);
        }
        const Algo = wasmModule.HashAlgorithm;
        const algoEnum = algorithm === 'sha1' ? Algo.Sha1 :
            algorithm === 'sha256' ? Algo.Sha256 :
                algorithm === 'sha512' ? Algo.Sha512 :
                    algorithm === 'md5' ? Algo.Md5 : undefined;
        if (!algoEnum)
            throw new Error(`Unsupported HMAC algorithm: ${algorithm}`);
        let stream = new wasmModule.StreamingHmac(new HMAC(wasmModule, options.key, algorithm)['toBuffer'](options.key), algoEnum);
        const format = options.outputFormat || 'hex';
        const instance = {
            update(data) {
                const buf = new HMAC(wasmModule, options.key, algorithm)['toBuffer'](data);
                // wasm method throws on error; surface as JS error
                stream.update(buf);
                return this;
            },
            digest(outFormat) {
                const out = stream.finalize();
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
exports.hmacSHA1 = createHMACFunction('sha1');
exports.hmacSHA256 = createHMACFunction('sha256');
exports.hmacSHA512 = createHMACFunction('sha512');
exports.hmacMD5 = createHMACFunction('md5');
// Export all HMAC functions as an object
exports.hmac = {
    sha1: exports.hmacSHA1,
    sha256: exports.hmacSHA256,
    sha512: exports.hmacSHA512,
    md5: exports.hmacMD5,
};
//# sourceMappingURL=index.js.map