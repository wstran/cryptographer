# Basic Usage Examples

This section provides comprehensive examples of how to use cryptographer.js for common cryptographic operations.

## Hash Functions

### Simple Hashing

```javascript
import crypto from 'cryptographer.js';

// SHA-256 hash
const hash = crypto.hash.sha256('Hello World');
console.log('SHA-256:', hash);
// Output: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e

// SHA-512 hash
const hash512 = crypto.hash.sha512('Hello World');
console.log('SHA-512:', hash512);

// BLAKE3 hash (faster)
const blake3Hash = crypto.hash.blake3('Hello World');
console.log('BLAKE3:', blake3Hash);

// BLAKE3 options
// Keyed hashing (32-byte key)
const b3Keyed = crypto.hash.blake3('Hello World', { keyed: Buffer.alloc(32, 1) });
// Derive-key mode
const b3Derive = crypto.hash.blake3('Hello World', { deriveKey: 'com.example.app' });
// Extendable output (XOF) length
const b3Xof = crypto.hash.blake3('Hello World', { hashLength: 64, outputFormat: 'base64' });
```

### Different Output Formats

```javascript
// Hex output (default)
const hexHash = crypto.hash.sha256('Hello World', { outputFormat: 'hex' });

// Base64 output
const base64Hash = crypto.hash.sha256('Hello World', { outputFormat: 'base64' });

// Buffer output
const bufferHash = crypto.hash.sha256('Hello World', { outputFormat: 'buffer' });

// Binary string output
const binaryHash = crypto.hash.sha256('Hello World', { outputFormat: 'binary' });

console.log('Hex:', hexHash);
console.log('Base64:', base64Hash);
console.log('Buffer length:', bufferHash.length);
console.log('Binary:', binaryHash);
```

### File Hashing

```javascript
import fs from 'fs';

function hashFile(filePath) {
  const hash = crypto.hash.sha256.create();
  const stream = fs.createReadStream(filePath);

  stream.on('data', (chunk) => {
    hash.update(chunk);
  });

  stream.on('end', () => {
    const fileHash = hash.digest('hex');
    console.log(`File hash: ${fileHash}`);
  });

  stream.on('error', (error) => {
    console.error('Error reading file:', error);
  });
}

// Usage
hashFile('example.txt');
```

## HMAC (Hash-based Message Authentication Code)

### Basic HMAC

```javascript
// HMAC with SHA-256
const hmac = crypto.hmac.sha256('Hello World', { key: 'secret' });
console.log('HMAC:', hmac);

// HMAC with different algorithms
const hmacSha1 = crypto.hmac.sha1('Hello World', { key: 'secret' });
const hmacSha512 = crypto.hmac.sha512('Hello World', { key: 'secret' });
const hmacMd5 = crypto.hmac.md5('Hello World', { key: 'secret' });

console.log('HMAC-SHA1:', hmacSha1);
console.log('HMAC-SHA512:', hmacSha512);
console.log('HMAC-MD5:', hmacMd5);
```

### API Authentication Example

```javascript
class APIAuthenticator {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  // Generate signature for API request
  signRequest(method, path, body, timestamp) {
    const message = `${method}\n${path}\n${body}\n${timestamp}`;
    return crypto.hmac.sha256(message, { key: this.secretKey });
  }

  // Verify signature from API request
  verifyRequest(method, path, body, timestamp, signature) {
    const expectedSignature = this.signRequest(method, path, body, timestamp);
    return crypto.timingSafeEqual(signature, expectedSignature);
  }
}

// Usage
const auth = new APIAuthenticator('my-secret-key');

// Client side
const method = 'POST';
const path = '/api/users';
const body = '{"name":"John","email":"john@example.com"}';
const timestamp = Date.now().toString();
const signature = auth.signRequest(method, path, body, timestamp);

console.log('Request signature:', signature);

// Server side
const isValid = auth.verifyRequest(method, path, body, timestamp, signature);
console.log('Signature valid:', isValid); // true
```

## Symmetric Encryption

### Basic Encryption/Decryption

```javascript
// Generate secure key and IV
const nodeCrypto = require('crypto');
const key = nodeCrypto.randomBytes(32); // 32 bytes for AES-256
const iv = nodeCrypto.randomBytes(16);  // 16 bytes for AES

// Encrypt data
const plaintext = 'Hello World';
const encrypted = crypto.cipher.aes.encrypt(plaintext, {
  key: key,
  iv: iv,
  mode: 'cbc'
});

console.log('Encrypted:', encrypted.toString('hex'));

// Decrypt data
const decrypted = crypto.cipher.aes.decrypt(encrypted, {
  key: key,
  iv: iv,
  mode: 'cbc'
});

console.log('Decrypted:', decrypted.toString()); // 'Hello World'
```

### Different AES Modes

```javascript
// CBC mode (Cipher Block Chaining) - recommended
const encryptedCBC = crypto.cipher.aes.encrypt('Hello World', {
  key: key,
  iv: iv,
  mode: 'cbc'
});

// ECB mode (Electronic Codebook) - not recommended for most use cases
const encryptedECB = crypto.cipher.aes.encrypt('Hello World', {
  key: key,
  mode: 'ecb' // No IV needed
});

// CTR mode (Counter) - good for parallel processing
const encryptedCTR = crypto.cipher.aes.encrypt('Hello World', {
  key: key,
  iv: iv, // Used as nonce in CTR mode
  mode: 'ctr'
});

console.log('CBC encrypted:', encryptedCBC.toString('hex'));
console.log('ECB encrypted:', encryptedECB.toString('hex'));
console.log('CTR encrypted:', encryptedCTR.toString('hex'));
```

### ChaCha20 / ChaCha20-Poly1305

```javascript
// ChaCha20 stream mode (CTR-like)
const ck = nodeCrypto.randomBytes(32);
const nonce = nodeCrypto.randomBytes(12);
const cenc = crypto.cipher.chacha20.encrypt('Hello World', { key: ck, iv: nonce, mode: 'ctr' });
const cdec = crypto.cipher.chacha20.decrypt(cenc, { key: ck, iv: nonce, mode: 'ctr' });

// Authenticated: mapped via 'cbc' to AEAD under the hood
const aeadNonce = nodeCrypto.randomBytes(12);
const aeadEnc = crypto.cipher.chacha20.encrypt('Secret', { key: ck, iv: aeadNonce, mode: 'cbc' });
const aeadDec = crypto.cipher.chacha20.decrypt(aeadEnc, { key: ck, iv: aeadNonce, mode: 'cbc' });
```

### DES / 3DES (Legacy)

```javascript
// DES (8 byte key) and 3DES (24 byte key). Use only for legacy interop.
const kdes = nodeCrypto.randomBytes(8);
const k3des = nodeCrypto.randomBytes(24);
const iv8 = nodeCrypto.randomBytes(8);

const desCBC = crypto.cipher.des.encrypt('Legacy', { key: kdes, iv: iv8, mode: 'cbc' });
const desPlain = crypto.cipher.des.decrypt(desCBC, { key: kdes, iv: iv8, mode: 'cbc' });

const tdesCTR = crypto.cipher.des.encrypt('Legacy', { key: k3des, iv: iv8, mode: 'ctr' });
const tdesPlain = crypto.cipher.des.decrypt(tdesCTR, { key: k3des, iv: iv8, mode: 'ctr' });
```

### File Encryption

```javascript
import fs from 'fs';

class FileEncryptor {
  constructor(key) {
    this.key = key;
  }

  // Encrypt file
  encryptFile(inputPath, outputPath) {
    const data = fs.readFileSync(inputPath);
    const iv = crypto.randomBytes(16);

    const encrypted = crypto.cipher.aes.encrypt(data, {
      key: this.key,
      iv: iv,
      mode: 'cbc'
    });

    // Store IV with encrypted data
    const result = Buffer.concat([iv, encrypted]);
    fs.writeFileSync(outputPath, result);

    console.log(`File encrypted: ${inputPath} -> ${outputPath}`);
  }

  // Decrypt file
  decryptFile(inputPath, outputPath) {
    const data = fs.readFileSync(inputPath);

    // Extract IV from first 16 bytes
    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);

    const decrypted = crypto.cipher.aes.decrypt(encrypted, {
      key: this.key,
      iv: iv,
      mode: 'cbc'
    });

    fs.writeFileSync(outputPath, decrypted);

    console.log(`File decrypted: ${inputPath} -> ${outputPath}`);
  }
}

// Usage
const key = crypto.randomBytes(32);
const encryptor = new FileEncryptor(key);

// Create test file
fs.writeFileSync('test.txt', 'Hello World!');

// Encrypt and decrypt
encryptor.encryptFile('test.txt', 'encrypted.bin');
encryptor.decryptFile('encrypted.bin', 'decrypted.txt');

// Verify
const original = fs.readFileSync('test.txt', 'utf8');
const decrypted = fs.readFileSync('decrypted.txt', 'utf8');
console.log('Original:', original);
console.log('Decrypted:', decrypted);
console.log('Match:', original === decrypted);
```

## Key Derivation Functions

### Argon2 Password Hashing

```javascript
// Argon2id (recommended for password hashing)
const password = 'mySecurePassword';
const salt = crypto.randomBytes(16);

const passwordHash = await crypto.kdf.argon2(password, {
  salt: salt,
  timeCost: 3,
  memoryCost: 65536, // 64MB
  parallelism: 4,
  variant: 'id'
});

console.log('Password hash:', passwordHash);
console.log('Salt:', salt.toString('hex'));
```

### bcrypt Password Hashing

```javascript
// Hash password with bcrypt
const password = 'mySecurePassword';
const bcryptHash = crypto.kdf.bcrypt.hash(password, { rounds: 12 });

console.log('bcrypt hash:', bcryptHash);

// Verify password
const isValid = crypto.kdf.bcrypt.verify(password, bcryptHash);
console.log('Password valid:', isValid); // true

// Verify wrong password
const isWrongValid = crypto.kdf.bcrypt.verify('wrongPassword', bcryptHash);
console.log('Wrong password valid:', isWrongValid); // false
```

### PBKDF2 Key Derivation

```javascript
// Derive key with PBKDF2
const password = 'myPassword';
const salt = 'mySalt';

const derivedKey = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 100000,
  keyLength: 32,
  hash: 'sha256'
});

console.log('Derived key (hex):', derivedKey.toString('hex'));

// Different output formats
const hexKey = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 100000,
  keyLength: 32,
  outputFormat: 'hex'
});

const base64Key = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 100000,
  keyLength: 32,
  outputFormat: 'base64'
});

console.log('Hex key:', hexKey);
console.log('Base64 key:', base64Key);
```

## Complete Example: Secure File Storage

```javascript
import fs from 'fs';

class SecureFileStorage {
  constructor(masterPassword) {
    this.masterPassword = masterPassword;
  }

  // Derive encryption key from master password
  deriveKey(salt) {
    return crypto.kdf.pbkdf2(this.masterPassword, {
      salt: salt,
      iterations: 100000,
      keyLength: 32,
      hash: 'sha256'
    });
  }

  // Store file securely
  async storeFile(filePath, outputPath) {
    const fileData = fs.readFileSync(filePath);
    const salt = crypto.randomBytes(16);
    const key = this.deriveKey(salt);
    const iv = crypto.randomBytes(16);

    // Encrypt file data
    const encrypted = crypto.cipher.aes.encrypt(fileData, {
      key: key,
      iv: iv,
      mode: 'cbc'
    });

    // Create HMAC for integrity
    const hmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), {
      key: key
    });

    // Store encrypted data with metadata
    const metadata = {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      hmac: hmac,
      algorithm: 'AES-256-CBC',
      kdf: 'PBKDF2-SHA256',
      iterations: 100000
    };

    const result = {
      metadata: metadata,
      data: encrypted.toString('hex')
    };

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`File stored securely: ${filePath} -> ${outputPath}`);
  }

  // Retrieve file securely
  async retrieveFile(encryptedPath, outputPath) {
    const encryptedData = JSON.parse(fs.readFileSync(encryptedPath, 'utf8'));
    const { metadata, data } = encryptedData;

    const salt = Buffer.from(metadata.salt, 'hex');
    const iv = Buffer.from(metadata.iv, 'hex');
    const key = this.deriveKey(salt);
    const encrypted = Buffer.from(data, 'hex');

    // Verify HMAC
    const expectedHmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), {
      key: key
    });

    if (metadata.hmac !== expectedHmac) {
      throw new Error('File integrity check failed');
    }

    // Decrypt data
    const decrypted = crypto.cipher.aes.decrypt(encrypted, {
      key: key,
      iv: iv,
      mode: 'cbc'
    });

    fs.writeFileSync(outputPath, decrypted);
    console.log(`File retrieved: ${encryptedPath} -> ${outputPath}`);
  }
}

// Usage
const storage = new SecureFileStorage('myMasterPassword');

// Create test file
fs.writeFileSync('secret.txt', 'This is a secret file!');

// Store file securely
await storage.storeFile('secret.txt', 'encrypted.json');

// Retrieve file
await storage.retrieveFile('encrypted.json', 'retrieved.txt');

// Verify
const original = fs.readFileSync('secret.txt', 'utf8');
const retrieved = fs.readFileSync('retrieved.txt', 'utf8');
console.log('Original:', original);
console.log('Retrieved:', retrieved);
console.log('Match:', original === retrieved);
```

## Error Handling

```javascript
try {
  // Hash operation
  const hash = crypto.hash.sha256('Hello World');
  console.log('Hash:', hash);

  // HMAC operation
  const hmac = crypto.hmac.sha256('Hello World', { key: 'secret' });
  console.log('HMAC:', hmac);

  // Encryption operation
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const encrypted = crypto.cipher.aes.encrypt('Hello World', { key, iv });
  console.log('Encrypted:', encrypted.toString('hex'));

  // KDF operation
  const derivedKey = crypto.kdf.pbkdf2('password', {
    salt: 'salt',
    iterations: 100000,
    keyLength: 32
  });
  console.log('Derived key:', derivedKey.toString('hex'));

} catch (error) {
  if (error.message.includes('Invalid input')) {
    console.error('Invalid input data');
  } else if (error.message.includes('Invalid key')) {
    console.error('Invalid key length or format');
  } else if (error.message.includes('Invalid IV')) {
    console.error('Invalid IV length or format');
  } else if (error.message.includes('WebAssembly')) {
    console.error('WebAssembly module failed to load');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Performance Testing

```javascript
function benchmark(operation, iterations = 100000) {
  const start = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    operation();
  }

  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds

  console.log(`Operation completed in ${duration.toFixed(2)}ms`);
  console.log(`Average time per operation: ${(duration / iterations).toFixed(6)}ms`);
  console.log(`Operations per second: ${(iterations / (duration / 1000)).toFixed(0)}`);
}

// Benchmark hash functions
console.log('=== SHA-256 Benchmark ===');
benchmark(() => crypto.hash.sha256('Hello World'));

console.log('\n=== BLAKE3 Benchmark ===');
benchmark(() => crypto.hash.blake3('Hello World'));

console.log('\n=== HMAC-SHA256 Benchmark ===');
benchmark(() => crypto.hmac.sha256('Hello World', { key: 'secret' }));

console.log('\n=== AES-256-CBC Benchmark ===');
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
benchmark(() => crypto.cipher.aes.encrypt('Hello World', { key, iv }));
```

These examples demonstrate the basic usage of all major features in cryptographer.js. Each example includes error handling and follows security best practices.