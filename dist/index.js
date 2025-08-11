"use strict";
/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.zk = exports.dsa = exports.kdf = exports.hmac = exports.cipher = exports.sha = void 0;
exports.randomBytes = randomBytes;
exports.timingSafeEqual = timingSafeEqual;
const tslib_1 = require("tslib");
// Export types for TypeScript consumers
tslib_1.__exportStar(require("./types"), exports);
// Import all modules (namespaced only)
const hash_1 = require("./hash");
Object.defineProperty(exports, "sha", { enumerable: true, get: function () { return hash_1.sha; } });
const cipher_1 = require("./cipher");
Object.defineProperty(exports, "cipher", { enumerable: true, get: function () { return cipher_1.cipher; } });
const hmac_1 = require("./hmac");
Object.defineProperty(exports, "hmac", { enumerable: true, get: function () { return hmac_1.hmac; } });
const kdf_1 = require("./kdf");
Object.defineProperty(exports, "kdf", { enumerable: true, get: function () { return kdf_1.kdf; } });
const dsa_1 = require("./dsa");
Object.defineProperty(exports, "dsa", { enumerable: true, get: function () { return dsa_1.dsa; } });
const crypto_1 = require("crypto");
const validation_1 = require("./utils/validation");
const zk_1 = require("./zk");
Object.defineProperty(exports, "zk", { enumerable: true, get: function () { return zk_1.zk; } });
// Do NOT re-export individual leaf functions. Consumers must use namespaced
// access patterns like cryptographer.sha.sha256, cryptographer.cipher.aes, etc.
// Utility helpers
function randomBytes(size) {
    if (!Number.isInteger(size) || size <= 0) {
        throw new Error('randomBytes size must be a positive integer');
    }
    return (0, crypto_1.randomBytes)(size);
}
function timingSafeEqual(a, b) {
    const ab = (0, validation_1.convertToBuffer)(a);
    const bb = (0, validation_1.convertToBuffer)(b);
    if (typeof crypto_1.timingSafeEqual === 'function') {
        if (ab.length !== bb.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(ab, bb);
    }
    return (0, validation_1.timeSafeEqual)(ab, bb);
}
// Default export with all modules
const cryptographer = {
    sha: hash_1.sha,
    cipher: cipher_1.cipher,
    hmac: hmac_1.hmac,
    kdf: kdf_1.kdf,
    dsa: dsa_1.dsa,
    randomBytes,
    timingSafeEqual,
    zk: zk_1.zk
};
exports.default = cryptographer;
//# sourceMappingURL=index.js.map