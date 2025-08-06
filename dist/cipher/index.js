"use strict";
/**
 * Cipher algorithms module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cipher = exports.aes = void 0;
/**
 * Base class for cipher algorithm wrappers
 */
class BaseCipher {
    constructor(wasmModule) {
        Object.defineProperty(this, "wasmModule", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.wasmModule = wasmModule;
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
    validateKeyLength(key, validLengths) {
        if (!validLengths.includes(key.length)) {
            throw new Error(`Invalid key length. Expected ${validLengths.join(', ')} bytes, got ${key.length}`);
        }
    }
}
/**
 * AES cipher implementation
 */
class AESCipher extends BaseCipher {
    encrypt(data, options) {
        const dataBuffer = this.toBuffer(data);
        const keyBuffer = this.toBuffer(options.key);
        // Validate key length (16, 24, or 32 bytes for AES-128, AES-192, AES-256)
        this.validateKeyLength(keyBuffer, [16, 24, 32]);
        const mode = options.mode || 'CBC';
        let result;
        switch (mode) {
            case 'CBC': {
                if (!options.iv) {
                    throw new Error('IV is required for CBC mode');
                }
                const ivBuffer = this.toBuffer(options.iv);
                if (ivBuffer.length !== 16) {
                    throw new Error('IV must be 16 bytes for AES');
                }
                result = this.wasmModule.aes_cbc_encrypt(dataBuffer, keyBuffer, ivBuffer);
                break;
            }
            case 'ECB': {
                result = this.wasmModule.aes_ecb_encrypt(dataBuffer, keyBuffer);
                break;
            }
            case 'CTR': {
                if (!options.iv) {
                    throw new Error('IV is required for CTR mode');
                }
                const ivBuffer = this.toBuffer(options.iv);
                result = this.wasmModule.aes_ctr_encrypt(dataBuffer, keyBuffer, ivBuffer);
                break;
            }
            default:
                throw new Error(`Unsupported cipher mode: ${mode}`);
        }
        return Buffer.from(result);
    }
    decrypt(data, options) {
        const dataBuffer = this.toBuffer(data);
        const keyBuffer = this.toBuffer(options.key);
        // Validate key length
        this.validateKeyLength(keyBuffer, [16, 24, 32]);
        const mode = options.mode || 'CBC';
        let result;
        switch (mode) {
            case 'CBC': {
                if (!options.iv) {
                    throw new Error('IV is required for CBC mode');
                }
                const ivBuffer = this.toBuffer(options.iv);
                if (ivBuffer.length !== 16) {
                    throw new Error('IV must be 16 bytes for AES');
                }
                result = this.wasmModule.aes_cbc_decrypt(dataBuffer, keyBuffer, ivBuffer);
                break;
            }
            case 'ECB': {
                result = this.wasmModule.aes_ecb_decrypt(dataBuffer, keyBuffer);
                break;
            }
            case 'CTR': {
                if (!options.iv) {
                    throw new Error('IV is required for CTR mode');
                }
                const ivBuffer = this.toBuffer(options.iv);
                result = this.wasmModule.aes_ctr_decrypt(dataBuffer, keyBuffer, ivBuffer);
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
function createCipherFunction(wasmPath) {
    let wasmModule;
    let cipherInstance;
    return {
        encrypt(data, options) {
            if (!wasmModule) {
                wasmModule = require(wasmPath);
                cipherInstance = new AESCipher(wasmModule);
            }
            return cipherInstance.encrypt(data, options);
        },
        decrypt(data, options) {
            if (!wasmModule) {
                wasmModule = require(wasmPath);
                cipherInstance = new AESCipher(wasmModule);
            }
            return cipherInstance.decrypt(data, options);
        },
    };
}
// Export cipher functions
exports.aes = createCipherFunction('../../wasm_packages/cipher/aes_wasm');
// Export all cipher functions as an object
exports.cipher = {
    aes: exports.aes,
};
//# sourceMappingURL=index.js.map