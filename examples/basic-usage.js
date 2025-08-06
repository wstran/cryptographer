#!/usr/bin/env node

/**
 * Basic Usage Examples for cryptographer.js
 * 
 * This file demonstrates the basic usage of all major functions
 * in the cryptographer.js library.
 */

const crypto = require('cryptographer.js');
const nodeCrypto = require('crypto');

console.log('🔐 cryptographer.js - Basic Usage Examples\n');

// ===== HASH FUNCTIONS =====
console.log('📋 Hash Functions:');

const message = 'Hello, World!';

// SHA-256 (recommended)
const sha256Hash = crypto.hash.sha256(message);
console.log(`SHA-256: ${sha256Hash}`);

// BLAKE3 (fastest)
const blake3Hash = crypto.hash.blake3(message);
console.log(`BLAKE3:  ${blake3Hash}`);

// Different output formats
const sha256Base64 = crypto.hash.sha256(message, { outputFormat: 'base64' });
console.log(`SHA-256 (Base64): ${sha256Base64}`);

// Streaming hash
const hasher = crypto.hash.sha256.create();
hasher.update('Hello, ');
hasher.update('World!');
const streamResult = hasher.digest();
console.log(`SHA-256 (Stream): ${streamResult}`);

console.log();

// ===== HMAC FUNCTIONS =====
console.log('🔑 HMAC Functions:');

const secretKey = 'my-secret-key';
const data = 'important message';

const hmacSha256 = crypto.hmac.sha256(data, { key: secretKey });
console.log(`HMAC-SHA256: ${hmacSha256}`);

const hmacSha512 = crypto.hmac.sha512(data, { key: secretKey });
console.log(`HMAC-SHA512: ${hmacSha512}`);

console.log();

// ===== CIPHER FUNCTIONS =====
console.log('🛡️ Cipher Functions (AES):');

// AES-256-CBC encryption
const aesKey = nodeCrypto.randomBytes(32); // 256-bit key
const iv = nodeCrypto.randomBytes(16);     // 128-bit IV

const plaintext = 'This is a secret message!';
console.log(`Plaintext: ${plaintext}`);

const encrypted = crypto.cipher.aes.encrypt(plaintext, {
  key: aesKey,
  iv: iv,
  mode: 'CBC'
});
console.log(`Encrypted: ${encrypted.toString('hex')}`);

const decrypted = crypto.cipher.aes.decrypt(encrypted, {
  key: aesKey,
  iv: iv,
  mode: 'CBC'
});
console.log(`Decrypted: ${decrypted.toString()}`);

console.log();

// ===== KEY DERIVATION FUNCTIONS =====
console.log('🔓 Key Derivation Functions:');

const password = 'user-password';
const salt = 'random-salt';

// PBKDF2
const pbkdf2Key = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 100000,
  keyLength: 32
});
console.log(`PBKDF2 Key: ${pbkdf2Key}`);

// Argon2id (recommended for passwords)
const argon2Key = crypto.kdf.argon2(password, {
  salt: salt,
  timeCost: 3,
  memoryCost: 4096,
  variant: 'argon2id'
});
console.log(`Argon2id Key: ${argon2Key}`);

// bcrypt
const bcryptHash = crypto.kdf.bcrypt.hash(password, { rounds: 10 });
console.log(`bcrypt Hash: ${bcryptHash}`);

const isValidPassword = crypto.kdf.bcrypt.verify(password, bcryptHash);
console.log(`Password Valid: ${isValidPassword}`);

console.log();

// ===== PRACTICAL EXAMPLE =====
console.log('🚀 Practical Example - Secure File Storage:');

function secureFileStorage() {
  const fileContent = 'This is sensitive file content.';
  const userPassword = 'user-master-password';
  
  // 1. Generate a random salt
  const fileSalt = nodeCrypto.randomBytes(32);
  
  // 2. Derive encryption key from password
  const encryptionKey = crypto.kdf.pbkdf2(userPassword, {
    salt: fileSalt,
    iterations: 100000,
    keyLength: 32,
    outputFormat: 'buffer'
  });
  
  // 3. Generate random IV
  const fileIv = nodeCrypto.randomBytes(16);
  
  // 4. Encrypt the content
  const encryptedContent = crypto.cipher.aes.encrypt(fileContent, {
    key: encryptionKey,
    iv: fileIv,
    mode: 'CBC'
  });
  
  // 5. Create integrity hash
  const integrityHash = crypto.hash.sha256(encryptedContent);
  
  console.log(`Original Content: ${fileContent}`);
  console.log(`Salt: ${fileSalt.toString('hex')}`);
  console.log(`IV: ${fileIv.toString('hex')}`);
  console.log(`Encrypted: ${encryptedContent.toString('hex')}`);
  console.log(`Integrity Hash: ${integrityHash}`);
  
  // Simulate storage and retrieval
  console.log('\n--- Retrieving and Decrypting ---');
  
  // 6. Derive the same key using stored salt
  const derivedKey = crypto.kdf.pbkdf2(userPassword, {
    salt: fileSalt,
    iterations: 100000,
    keyLength: 32,
    outputFormat: 'buffer'
  });
  
  // 7. Verify integrity
  const computedHash = crypto.hash.sha256(encryptedContent);
  if (computedHash !== integrityHash) {
    throw new Error('File integrity check failed!');
  }
  console.log('✓ Integrity check passed');
  
  // 8. Decrypt the content
  const decryptedContent = crypto.cipher.aes.decrypt(encryptedContent, {
    key: derivedKey,
    iv: fileIv,
    mode: 'CBC'
  });
  
  console.log(`Decrypted Content: ${decryptedContent.toString()}`);
  console.log('✓ File successfully decrypted');
}

secureFileStorage();

console.log('\n🎉 All examples completed successfully!');