# Quick Start

Get up and running with cryptographer.js in just a few minutes.

## Basic Usage

### 1. Hash Functions

```javascript
import crypto from 'cryptographer.js';

// SHA-256 hash
const hash = crypto.hash.sha256('Hello World');
console.log(hash); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// SHA-512 hash
const hash512 = crypto.hash.sha512('Hello World');

// BLAKE3 hash (faster than SHA-256)
const blake3Hash = crypto.hash.blake3('Hello World');

// Different output formats
const hexHash = crypto.hash.sha256('Hello World', { outputFormat: 'hex' });
const base64Hash = crypto.hash.sha256('Hello World', { outputFormat: 'base64' });
const bufferHash = crypto.hash.sha256('Hello World', { outputFormat: 'buffer' });
```

### 2. HMAC (Hash-based Message Authentication Code)

```javascript
// HMAC with SHA-256
const hmac = crypto.hmac.sha256('data', { key: 'secret' });

// HMAC with different hash algorithms
const hmacSha1 = crypto.hmac.sha1('data', { key: 'secret' });
const hmacSha512 = crypto.hmac.sha512('data', { key: 'secret' });
const hmacMd5 = crypto.hmac.md5('data', { key: 'secret' });
```

### 3. Symmetric Encryption (AES, ChaCha20, DES/3DES)

```javascript
// AES-256-CBC
const nodeCrypto = require('crypto');
const key = nodeCrypto.randomBytes(32);
const iv = nodeCrypto.randomBytes(16);
const enc = crypto.cipher.aes.encrypt('Hello World', { key, iv, mode: 'cbc' });
const dec = crypto.cipher.aes.decrypt(enc, { key, iv, mode: 'cbc' });
console.log(dec.toString()); // 'Hello World'

// ChaCha20 (CTR-like stream)
const ck = nodeCrypto.randomBytes(32);
const nonce = nodeCrypto.randomBytes(12);
const cc = crypto.cipher.chacha20.encrypt('Hello', { key: ck, iv: nonce, mode: 'ctr' });
const dd = crypto.cipher.chacha20.decrypt(cc, { key: ck, iv: nonce, mode: 'ctr' });

// ChaCha20-Poly1305 AEAD (mapped via mode: 'cbc')
const aeadNonce = nodeCrypto.randomBytes(12);
const ct = crypto.cipher.chacha20.encrypt('Secret', { key: ck, iv: aeadNonce, mode: 'cbc' });
const pt = crypto.cipher.chacha20.decrypt(ct, { key: ck, iv: aeadNonce, mode: 'cbc' });

// DES/3DES (legacy; avoid in new systems)
const kdes = nodeCrypto.randomBytes(8);
const k3des = nodeCrypto.randomBytes(24);
const iv8 = nodeCrypto.randomBytes(8);
const encDes = crypto.cipher.des.encrypt('legacy', { key: kdes, iv: iv8, mode: 'cbc' });
const decDes = crypto.cipher.des.decrypt(encDes, { key: kdes, iv: iv8, mode: 'cbc' });
```

### 4. Key Derivation Functions

### 5. Public-Key & Key Exchange

```javascript
// X25519 key exchange
const a = crypto.x25519.generateKeypair();
const b = crypto.x25519.generateKeypair();
const ssA = crypto.x25519.deriveSharedSecret(a.privateKey, b.publicKey);
const ssB = crypto.x25519.deriveSharedSecret(b.privateKey, a.publicKey);

// (PQC KEM removed in this build)
```

```javascript
// PBKDF2
const derivedKey = crypto.kdf.pbkdf2('password', {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32
});

// Argon2id (recommended for password hashing)
const passwordHash = crypto.kdf.argon2('password', {
  salt: crypto.randomBytes(16),
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4
});

// bcrypt
const bcryptHash = crypto.kdf.bcrypt.hash('password', { rounds: 12 });
const isValid = crypto.kdf.bcrypt.verify('password', bcryptHash);
```

## Advanced Usage

### Streaming Hash Operations

```javascript
// For large files or data streams
const hash = crypto.hash.sha256.create();
hash.update('Hello');
hash.update(' ');
hash.update('World');
const result = hash.digest('hex');
```

### File Encryption

```javascript
import fs from 'fs';

// Encrypt a file
const fileBuffer = fs.readFileSync('input.txt');
const encrypted = crypto.cipher.aes.encrypt(fileBuffer, {
  key: key,
  iv: iv
});
fs.writeFileSync('encrypted.bin', encrypted);

// Decrypt a file
const encryptedBuffer = fs.readFileSync('encrypted.bin');
const decrypted = crypto.cipher.aes.decrypt(encryptedBuffer, {
  key: key,
  iv: iv
});
fs.writeFileSync('decrypted.txt', decrypted);
```

### Password Management System

```javascript
class PasswordManager {
  static async hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const hash = await crypto.kdf.argon2(password, {
      salt: salt,
      timeCost: 3,
      memoryCost: 65536,
      parallelism: 4
    });
    return { hash, salt: salt.toString('hex') };
  }

  static async verifyPassword(password, hash, salt) {
    const computedHash = await crypto.kdf.argon2(password, {
      salt: Buffer.from(salt, 'hex'),
      timeCost: 3,
      memoryCost: 65536,
      parallelism: 4
    });
    return computedHash === hash;
  }
}

// Usage
const { hash, salt } = await PasswordManager.hashPassword('myPassword');
const isValid = await PasswordManager.verifyPassword('myPassword', hash, salt);
```

## Performance Tips

### 1. Reuse Hash Instances

```javascript
// Good: Reuse hash instance
const hash = crypto.hash.sha256.create();
for (const chunk of dataChunks) {
  hash.update(chunk);
}
const result = hash.digest();

// Avoid: Create new hash for each chunk
for (const chunk of dataChunks) {
  const hash = crypto.hash.sha256(chunk); // Inefficient
}
```

### 2. Use Appropriate Algorithms

```javascript
// For general hashing: SHA-256 or BLAKE3
const hash = crypto.hash.sha256(data);

// For password hashing: Argon2id
const passwordHash = crypto.kdf.argon2(password, options);

// For key derivation: PBKDF2
const key = crypto.kdf.pbkdf2(password, options);
```

### 3. Optimize Buffer Operations

```javascript
// Good: Use Buffer directly
const hash = crypto.hash.sha256(buffer);

// Avoid: Convert to string unnecessarily
const hash = crypto.hash.sha256(buffer.toString());
```

## Error Handling

```javascript
try {
  const hash = crypto.hash.sha256(data);
} catch (error) {
  if (error.message.includes('Invalid input')) {
    console.error('Invalid input data');
  } else if (error.message.includes('WebAssembly')) {
    console.error('WebAssembly module failed to load');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Next Steps

- Explore the [API Reference](../api-reference/) for complete function documentation
- Check out [Examples](../examples/) for real-world use cases
- Learn about [Security Best Practices](../security/) for production use
- Review [Performance Benchmarks](../performance/) for optimization tips