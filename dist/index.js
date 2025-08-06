"use strict";
/**
 * cryptographer.js - High-performance cryptographic algorithms for Node.js using WebAssembly
 *
 * @module cryptographer.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.kdf = exports.hmac = exports.cipher = exports.hash = exports.bcrypt = exports.argon2 = exports.pbkdf2 = exports.hmacMD5 = exports.hmacSHA512 = exports.hmacSHA256 = exports.hmacSHA1 = exports.aes = exports.ripemd160 = exports.whirlpool = exports.blake3 = exports.blake2s = exports.blake2b = exports.md5 = exports.md4 = exports.sha3_512 = exports.sha3_256 = exports.sha512 = exports.sha256 = exports.sha1 = void 0;
const tslib_1 = require("tslib");
// Export types
tslib_1.__exportStar(require("./types"), exports);
// Import all modules
const hash_1 = require("./hash");
Object.defineProperty(exports, "hash", { enumerable: true, get: function () { return hash_1.hash; } });
const cipher_1 = require("./cipher");
Object.defineProperty(exports, "cipher", { enumerable: true, get: function () { return cipher_1.cipher; } });
const hmac_1 = require("./hmac");
Object.defineProperty(exports, "hmac", { enumerable: true, get: function () { return hmac_1.hmac; } });
const kdf_1 = require("./kdf");
Object.defineProperty(exports, "kdf", { enumerable: true, get: function () { return kdf_1.kdf; } });
// Re-export individual functions for convenience
var hash_2 = require("./hash");
// Hash functions
Object.defineProperty(exports, "sha1", { enumerable: true, get: function () { return hash_2.sha1; } });
Object.defineProperty(exports, "sha256", { enumerable: true, get: function () { return hash_2.sha256; } });
Object.defineProperty(exports, "sha512", { enumerable: true, get: function () { return hash_2.sha512; } });
Object.defineProperty(exports, "sha3_256", { enumerable: true, get: function () { return hash_2.sha3_256; } });
Object.defineProperty(exports, "sha3_512", { enumerable: true, get: function () { return hash_2.sha3_512; } });
Object.defineProperty(exports, "md4", { enumerable: true, get: function () { return hash_2.md4; } });
Object.defineProperty(exports, "md5", { enumerable: true, get: function () { return hash_2.md5; } });
Object.defineProperty(exports, "blake2b", { enumerable: true, get: function () { return hash_2.blake2b; } });
Object.defineProperty(exports, "blake2s", { enumerable: true, get: function () { return hash_2.blake2s; } });
Object.defineProperty(exports, "blake3", { enumerable: true, get: function () { return hash_2.blake3; } });
Object.defineProperty(exports, "whirlpool", { enumerable: true, get: function () { return hash_2.whirlpool; } });
Object.defineProperty(exports, "ripemd160", { enumerable: true, get: function () { return hash_2.ripemd160; } });
var cipher_2 = require("./cipher");
// Cipher functions
Object.defineProperty(exports, "aes", { enumerable: true, get: function () { return cipher_2.aes; } });
var hmac_2 = require("./hmac");
// HMAC functions
Object.defineProperty(exports, "hmacSHA1", { enumerable: true, get: function () { return hmac_2.hmacSHA1; } });
Object.defineProperty(exports, "hmacSHA256", { enumerable: true, get: function () { return hmac_2.hmacSHA256; } });
Object.defineProperty(exports, "hmacSHA512", { enumerable: true, get: function () { return hmac_2.hmacSHA512; } });
Object.defineProperty(exports, "hmacMD5", { enumerable: true, get: function () { return hmac_2.hmacMD5; } });
var kdf_2 = require("./kdf");
// KDF functions
Object.defineProperty(exports, "pbkdf2", { enumerable: true, get: function () { return kdf_2.pbkdf2; } });
Object.defineProperty(exports, "argon2", { enumerable: true, get: function () { return kdf_2.argon2; } });
Object.defineProperty(exports, "bcrypt", { enumerable: true, get: function () { return kdf_2.bcrypt; } });
// Default export with all modules
const cryptographer = {
    hash: hash_1.hash,
    cipher: cipher_1.cipher,
    hmac: hmac_1.hmac,
    kdf: kdf_1.kdf
};
exports.default = cryptographer;
//# sourceMappingURL=index.js.map