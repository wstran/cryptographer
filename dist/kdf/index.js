"use strict";
/**
 * Key Derivation Functions (KDF) module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.kdf = exports.bcrypt = exports.argon2 = exports.pbkdf2 = void 0;
/**
 * Base class for KDF wrappers
 */
class BaseKDF {
    constructor(wasmModule) {
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
 * PBKDF2 implementation
 */
class PBKDF2 extends BaseKDF {
    derive(password, options) {
        const passwordBuffer = this.toBuffer(password);
        const saltBuffer = this.toBuffer(options.salt);
        const iterations = options.iterations || 100000;
        const keyLength = options.keyLength || 32;
        const result = this.wasmModule.pbkdf2_sha256(passwordBuffer, saltBuffer, iterations, keyLength);
        return this.formatOutput(result, options.outputFormat || 'hex');
    }
}
/**
 * Argon2 implementation
 */
class Argon2 extends BaseKDF {
    derive(password, options) {
        const passwordBuffer = this.toBuffer(password);
        const saltBuffer = this.toBuffer(options.salt);
        const config = {
            timeCost: options.timeCost || 3,
            memoryCost: options.memoryCost || 4096,
            parallelism: options.parallelism || 1,
            keyLength: options.keyLength || 32,
            variant: options.variant || 'argon2id'
        };
        let result;
        switch (config.variant) {
            case 'argon2i':
                result = this.wasmModule.argon2i(passwordBuffer, saltBuffer, config.timeCost, config.memoryCost, config.parallelism, config.keyLength);
                break;
            case 'argon2d':
                result = this.wasmModule.argon2d(passwordBuffer, saltBuffer, config.timeCost, config.memoryCost, config.parallelism, config.keyLength);
                break;
            case 'argon2id':
                result = this.wasmModule.argon2id(passwordBuffer, saltBuffer, config.timeCost, config.memoryCost, config.parallelism, config.keyLength);
                break;
            default:
                throw new Error(`Unknown Argon2 variant: ${config.variant}`);
        }
        return this.formatOutput(result, options.outputFormat || 'hex');
    }
}
/**
 * Bcrypt implementation
 */
class Bcrypt extends BaseKDF {
    hash(password, options) {
        const passwordBuffer = this.toBuffer(password);
        const rounds = options?.rounds || 10;
        if (rounds < 4 || rounds > 31) {
            throw new Error('Bcrypt rounds must be between 4 and 31');
        }
        // Generate salt and hash
        const result = this.wasmModule.bcrypt_hash(passwordBuffer, rounds);
        return Buffer.from(result).toString('utf8');
    }
    verify(password, hash) {
        const passwordBuffer = this.toBuffer(password);
        const hashBuffer = Buffer.from(hash, 'utf8');
        return this.wasmModule.bcrypt_verify(passwordBuffer, hashBuffer);
    }
}
/**
 * Create PBKDF2 function
 */
exports.pbkdf2 = (function () {
    let wasmModule;
    return function (password, options) {
        if (!wasmModule) {
            wasmModule = require('../../packages/pha/pbkdf2_wasm');
        }
        const pbkdf2Instance = new PBKDF2(wasmModule);
        return pbkdf2Instance.derive(password, options);
    };
})();
/**
 * Create Argon2 function
 */
exports.argon2 = (function () {
    let wasmModule;
    return function (password, options) {
        if (!wasmModule) {
            wasmModule = require('../../packages/pha/argon2_wasm');
        }
        const argon2Instance = new Argon2(wasmModule);
        return argon2Instance.derive(password, options);
    };
})();
/**
 * Create Bcrypt functions
 */
exports.bcrypt = (function () {
    let wasmModule;
    let bcryptInstance;
    return {
        hash(password, options) {
            if (!wasmModule) {
                wasmModule = require('../../packages/pha/bcrypt_wasm');
                bcryptInstance = new Bcrypt(wasmModule);
            }
            return bcryptInstance.hash(password, options);
        },
        verify(password, hash) {
            if (!wasmModule) {
                wasmModule = require('../../packages/pha/bcrypt_wasm');
                bcryptInstance = new Bcrypt(wasmModule);
            }
            return bcryptInstance.verify(password, hash);
        }
    };
})();
// Export all KDF functions as an object
exports.kdf = {
    pbkdf2: exports.pbkdf2,
    argon2: exports.argon2,
    bcrypt: exports.bcrypt
};
//# sourceMappingURL=index.js.map