// WASM Modules Index
// This file exports all compiled WASM modules

// SHA modules
const blake2_wasm = require('./sha/blake2_wasm');
const blake3_wasm = require('./sha/blake3_wasm');
const md4_wasm = require('./sha/md4_wasm');
const md5_wasm = require('./sha/md5_wasm');
const ripemd160_wasm = require('./sha/ripemd160_wasm');
const sha1_wasm = require('./sha/sha1_wasm');
const sha2_wasm = require('./sha/sha2_wasm');
const sha3_wasm = require('./sha/sha3_wasm');
const whirlpool_wasm = require('./sha/whirlpool_wasm');

// HMAC modules
const hmac_wasm = require('./hmac/hmac_wasm');

// PHA (Password Hashing Algorithm) modules
const bcrypt_wasm = require('./pha/bcrypt_wasm');
const argon2_wasm = require('./pha/argon2_wasm');
const pbkdf2_wasm = require('./pha/pbkdf2_wasm');

// Cipher modules
const aes_wasm = require('./cipher/aes_wasm');

module.exports = {
  // SHA
  blake2_wasm,
  blake3_wasm,
  md4_wasm,
  md5_wasm,
  ripemd160_wasm,
  sha1_wasm,
  sha2_wasm,
  sha3_wasm,
  whirlpool_wasm,

  // HMAC
  hmac_wasm,

  // PHA
  bcrypt_wasm,
  argon2_wasm,
  pbkdf2_wasm,

  // Cipher
  aes_wasm
};