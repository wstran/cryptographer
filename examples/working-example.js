const crypto = require('../dist/index.js');

console.log('🔐 cryptographer.js Working Example');
console.log('====================================');

// Example 1: Basic Hashing
console.log('\n📝 Example 1: Basic Hashing');
const message = 'Hello, cryptographer.js!';
console.log(`Message: "${message}"`);

const sha256Hash = crypto.sha.sha256(message);
console.log(`SHA-256: ${sha256Hash}`);

const md5Hash = crypto.sha.md5(message);
console.log(`MD5: ${md5Hash}`);

const blake3Hash = crypto.sha.blake3(message);
console.log(`BLAKE3: ${blake3Hash}`);

// Example 2: HMAC (Hash-based Message Authentication Code)
console.log('\n🔐 Example 2: HMAC');
const secretKey = 'my-secret-key';
const hmacSha256 = crypto.hmac.sha256(message, { key: secretKey });
console.log(`HMAC-SHA256: ${hmacSha256}`);

// Example 3: Key Derivation (PBKDF2)
console.log('\n🔑 Example 3: Key Derivation');
const password = 'user-password-123';
const salt = 'random-salt-value';
const derivedKey = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 10000,
  keyLength: 32
});
console.log(`Derived Key: ${derivedKey}`);

// Example 4: Streaming Hash
console.log('\n🌊 Example 4: Streaming Hash');
const streamingHash = crypto.sha.sha256.create();
streamingHash.update('Hello');
streamingHash.update(', ');
streamingHash.update('World!');
const streamedResult = streamingHash.digest('hex');
console.log(`Streaming Result: ${streamedResult}`);

// Example 5: Different Output Formats
console.log('\n📊 Example 5: Different Output Formats');
const testData = 'Format test data';
const hexFormat = crypto.sha.sha256(testData, { outputFormat: 'hex' });
const base64Format = crypto.sha.sha256(testData, { outputFormat: 'base64' });
const bufferFormat = crypto.sha.sha256(testData, { outputFormat: 'buffer' });

console.log(`Hex: ${hexFormat}`);
console.log(`Base64: ${base64Format}`);
console.log(`Buffer length: ${bufferFormat.length} bytes`);

// Example 6: Performance Comparison
console.log('\n⚡ Example 6: Performance Comparison');
const performanceData = 'This is a longer string for performance testing. It should be long enough to measure differences between algorithms.';
const iterations = 1000;

const algorithms = [
  { name: 'SHA-256', func: crypto.sha.sha256 },
  { name: 'SHA-512', func: crypto.sha.sha512 },
  { name: 'BLAKE3', func: crypto.sha.blake3 },
  { name: 'MD5', func: crypto.sha.md5 }
];

console.log(`Benchmarking ${iterations} iterations with ${performanceData.length} character input:`);

algorithms.forEach(({ name, func }) => {
  const start = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    func(performanceData);
  }

  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  const opsPerSecond = Math.round((iterations / duration) * 1000);

  console.log(`${name}: ${opsPerSecond.toLocaleString()} ops/sec (${duration.toFixed(2)}ms)`);
});

// Example 7: Security Verification
console.log('\n🔒 Example 7: Security Verification');
const sameInput = 'test';
const differentInput = 'test2';

const hash1 = crypto.sha.sha256(sameInput);
const hash2 = crypto.sha.sha256(sameInput);
const hash3 = crypto.sha.sha256(differentInput);

console.log(`Same input, hash 1: ${hash1}`);
console.log(`Same input, hash 2: ${hash2}`);
console.log(`Different input: ${hash3}`);
console.log(`Deterministic (same input = same hash): ${hash1 === hash2 ? '✅' : '❌'}`);
console.log(`Collision resistant (different input ≠ same hash): ${hash1 !== hash3 ? '✅' : '❌'}`);

console.log('\n🎉 All examples completed successfully!');
console.log('\n📚 Available Functions:');
console.log('- Hash: sha1, sha256, sha512, md4, md5, blake2b, blake2s, blake3, whirlpool, ripemd160');
console.log('- HMAC: sha1, sha256, sha512, md5');
console.log('- KDF: pbkdf2, argon2, bcrypt');
console.log('- Cipher: aes');