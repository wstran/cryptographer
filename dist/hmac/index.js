"use strict";
/**
 * HMAC (Hash-based Message Authentication Code) module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmac = exports.hmacMD5 = exports.hmacSHA512 = exports.hmacSHA256 = exports.hmacSHA1 = void 0;
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
    return function (data, options) {
        if (!wasmModule) {
            wasmModule = require('../../wasm_packages/hmac/hmac_wasm');
        }
        const hmac = new HMAC(wasmModule, options.key, algorithm);
        return hmac.digest(data, options.outputFormat || 'hex');
    };
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