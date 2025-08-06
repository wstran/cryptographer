# API Reference

This document provides a comprehensive reference for all functions and types available in `cryptographer.js`.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Common Types](#common-types)
- [Hash Functions](#hash-functions)
- [HMAC Functions](#hmac-functions)
- [Cipher Functions](#cipher-functions)
- [Key Derivation Functions](#key-derivation-functions)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Examples](#examples)

## Installation & Setup

### Installation

```bash
npm install cryptographer.js
```

### Basic Import

```javascript
// CommonJS
const crypto = require('cryptographer.js');

// ES Modules
import crypto from 'cryptographer.js';

// TypeScript with types
import crypto, { 
  CryptoInput, 
  HashOptions, 
  CipherOptions 
} from 'cryptographer.js';
```

### Individual Function Imports

```javascript
// Import specific functions
import { sha256, aes, pbkdf2 } from 'cryptographer.js';

// Or access via namespace
import crypto from 'cryptographer.js';
const { hash, cipher, kdf } = crypto;
```

## Common Types

### CryptoInput

Represents input data that can be processed by cryptographic functions.

```typescript
type CryptoInput = string | Buffer | Uint8Array;
```

**Examples:**
```javascript
// String input
crypto.hash.sha256('Hello World');

// Buffer input
crypto.hash.sha256(Buffer.from('Hello World', 'utf8'));

// Uint8Array input
crypto.hash.sha256(new Uint8Array([72, 101, 108, 108, 111]));
```

### HashOutput

Specifies the output format for hash functions.

```typescript
type HashOutput = 'hex' | 'base64' | 'binary' | 'buffer';
```

**Examples:**
```javascript
// Hex output (default)
crypto.hash.sha256('test'); // Returns: string (hex)

// Base64 output
crypto.hash.sha256('test', { outputFormat: 'base64' }); // Returns: string (base64)

// Buffer output
crypto.hash.sha256('test', { outputFormat: 'buffer' }); // Returns: Buffer

// Binary string output
crypto.hash.sha256('test', { outputFormat: 'binary' }); // Returns: string (binary)
```

### HashOptions

Common options for hash functions.

```typescript
interface HashOptions {
  outputFormat?: HashOutput; // Default: 'hex'
}
```

## Hash Functions

All hash functions follow the same pattern and support streaming operations.

### Function Signature

```typescript
interface HashFunction {
  (input: CryptoInput, options?: HashOptions): string | Buffer;
  create(): HashInstance;
}
```

### Available Hash Functions

#### SHA Family

**SHA-256** (Recommended)
```javascript
crypto.hash.sha256(data, options?)
```
- **Standard**: FIPS 180-4
- **Output Size**: 256 bits (32 bytes)
- **Security**: ✅ Secure
- **Performance**: Excellent

**SHA-512** (Recommended)
```javascript
crypto.hash.sha512(data, options?)
```
- **Standard**: FIPS 180-4
- **Output Size**: 512 bits (64 bytes)
- **Security**: ✅ Secure
- **Performance**: Very Good

**SHA-1** (Legacy Only)
```javascript
crypto.hash.sha1(data, options?)
```
- **Standard**: RFC 3174
- **Output Size**: 160 bits (20 bytes)
- **Security**: ⚠️ **DEPRECATED** - Use only for legacy compatibility
- **Performance**: Good

#### SHA-3 Family

**SHA3-256** (Recommended)
```javascript
crypto.hash.sha3_256(data, options?)
```
- **Standard**: FIPS 202
- **Output Size**: 256 bits (32 bytes)
- **Security**: ✅ Secure (Latest standard)
- **Performance**: Good

**SHA3-512** (Recommended)
```javascript
crypto.hash.sha3_512(data, options?)
```
- **Standard**: FIPS 202
- **Output Size**: 512 bits (64 bytes)
- **Security**: ✅ Secure (Latest standard)
- **Performance**: Good

#### BLAKE Family

**BLAKE2b** (Recommended)
```javascript
crypto.hash.blake2b(data, options?)
```
- **Standard**: RFC 7693
- **Output Size**: 512 bits (64 bytes)
- **Security**: ✅ Secure
- **Performance**: Excellent (faster than SHA-2)

**BLAKE2s** (Recommended)
```javascript
crypto.hash.blake2s(data, options?)
```
- **Standard**: RFC 7693
- **Output Size**: 256 bits (32 bytes)
- **Security**: ✅ Secure
- **Performance**: Excellent (optimized for smaller platforms)

**BLAKE3** (Recommended)
```javascript
crypto.hash.blake3(data, options?)
```
- **Standard**: None (latest BLAKE version)
- **Output Size**: 256 bits (32 bytes)
- **Security**: ✅ Secure
- **Performance**: Exceptional (fastest available)

#### MD Family (Legacy Only)

**MD5** (Legacy Only)
```javascript
crypto.hash.md5(data, options?)
```
- **Standard**: RFC 1321
- **Output Size**: 128 bits (16 bytes)
- **Security**: ❌ **BROKEN** - Use only for non-cryptographic purposes
- **Performance**: Excellent

**MD4** (Legacy Only)
```javascript
crypto.hash.md4(data, options?)
```
- **Standard**: RFC 1320
- **Output Size**: 128 bits (16 bytes)
- **Security**: ❌ **BROKEN** - Use only for non-cryptographic purposes
- **Performance**: Excellent

#### Other Hash Functions

**Whirlpool**
```javascript
crypto.hash.whirlpool(data, options?)
```
- **Standard**: ISO/IEC 10118-3
- **Output Size**: 512 bits (64 bytes)
- **Security**: ✅ Secure
- **Performance**: Good

**RIPEMD-160**
```javascript
crypto.hash.ripemd160(data, options?)
```
- **Standard**: None (ISO/IEC 10118-3 variant)
- **Output Size**: 160 bits (20 bytes)
- **Security**: ✅ Secure (used in Bitcoin)
- **Performance**: Good

### Streaming Hash Interface

For processing large amounts of data or streaming scenarios.

```typescript
interface HashInstance {
  update(data: CryptoInput): this;
  digest(format?: HashOutput): string | Buffer;
  reset(): this;
}
```

**Example:**
```javascript
const hasher = crypto.hash.sha256.create();

// Add data incrementally
hasher.update('Hello ');
hasher.update('World');
hasher.update(Buffer.from('!'));

// Get final result
const result = hasher.digest(); // 'hex' format by default
const base64Result = hasher.digest('base64');

// Reset for reuse
hasher.reset();
hasher.update('New data');
const newResult = hasher.digest();
```

## HMAC Functions

Hash-based Message Authentication Code for data integrity and authenticity.

### Function Signature

```typescript
function hmac(data: CryptoInput, options: HMACOptions): string | Buffer;

interface HMACOptions extends HashOptions {
  key: CryptoInput;
}
```

### Available HMAC Functions

**HMAC-SHA256** (Recommended)
```javascript
crypto.hmac.sha256(data, { key, outputFormat? })
```

**HMAC-SHA512** (Recommended)
```javascript
crypto.hmac.sha512(data, { key, outputFormat? })
```

**HMAC-SHA1** (Legacy)
```javascript
crypto.hmac.sha1(data, { key, outputFormat? })
```

**HMAC-MD5** (Legacy)
```javascript
crypto.hmac.md5(data, { key, outputFormat? })
```

### Examples

```javascript
// Basic HMAC
const hmac = crypto.hmac.sha256('message', { key: 'secret-key' });

// With Buffer key
const key = Buffer.from('my-secret-key', 'utf8');
const hmac2 = crypto.hmac.sha512('data', { key });

// Base64 output
const hmac3 = crypto.hmac.sha256('data', { 
  key: 'secret', 
  outputFormat: 'base64' 
});

// Verify HMAC
const message = 'important data';
const secret = 'shared-secret';
const expectedHmac = crypto.hmac.sha256(message, { key: secret });

// Later, verify the message
const receivedHmac = 'received-hmac-value';
const isValid = crypto.timeSafeEqual(
  Buffer.from(expectedHmac, 'hex'),
  Buffer.from(receivedHmac, 'hex')
);
```

## Cipher Functions

Symmetric encryption and decryption operations.

### AES (Advanced Encryption Standard)

Currently supported cipher with multiple modes and key sizes.

```typescript
interface CipherFunction {
  encrypt(data: CryptoInput, options: CipherOptions): Buffer;
  decrypt(data: CryptoInput, options: CipherOptions): Buffer;
}

interface CipherOptions {
  key: CryptoInput;
  iv?: CryptoInput;
  mode?: 'CBC' | 'ECB' | 'CTR';
  padding?: 'PKCS7' | 'NoPadding' | 'ZeroPadding';
}
```

#### Key Sizes

- **AES-128**: 16 bytes (128 bits)
- **AES-192**: 24 bytes (192 bits)
- **AES-256**: 32 bytes (256 bits) - **Recommended**

#### Modes

**CBC (Cipher Block Chaining)** - Default, Recommended
- Requires IV (Initialization Vector)
- IV must be 16 bytes for AES
- Each block depends on previous block
- Most widely supported

**ECB (Electronic Codebook)** - Not Recommended
- Does not require IV
- Each block encrypted independently
- **Security Warning**: Identical plaintext blocks produce identical ciphertext

**CTR (Counter)** - Recommended for streaming
- Requires IV (used as counter)
- Can be parallelized
- Good for streaming applications

#### Padding

**PKCS7** - Default, Recommended
- Standard padding scheme
- Automatically handles data that's not block-aligned

**NoPadding**
- Data must be exactly block-size aligned
- User responsible for padding

**ZeroPadding**
- Pads with zero bytes
- Less secure than PKCS7

### Examples

```javascript
// AES-256-CBC Encryption (Recommended)
const key = crypto.randomBytes(32); // 256-bit key
const iv = crypto.randomBytes(16);  // 128-bit IV

const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key,
  iv,
  mode: 'CBC',
  padding: 'PKCS7'
});

const decrypted = crypto.cipher.aes.decrypt(encrypted, {
  key,
  iv,
  mode: 'CBC'
});

console.log(decrypted.toString()); // 'Hello World'

// AES-128-ECB (Not recommended)
const key128 = crypto.randomBytes(16);
const encrypted2 = crypto.cipher.aes.encrypt('Hello World', {
  key: key128,
  mode: 'ECB'
});

// AES-256-CTR for streaming
const ctrKey = crypto.randomBytes(32);
const ctrIv = crypto.randomBytes(16);

const encryptedCtr = crypto.cipher.aes.encrypt('Large data stream', {
  key: ctrKey,
  iv: ctrIv,
  mode: 'CTR'
});
```

## Key Derivation Functions

Functions for deriving cryptographic keys from passwords or other key material.

### PBKDF2

Password-Based Key Derivation Function 2, widely supported standard.

```typescript
interface KDFOptions {
  salt: CryptoInput;
  iterations?: number;    // Default: 100000
  keyLength?: number;     // Default: 32 bytes
  outputFormat?: HashOutput; // Default: 'hex'
}

function pbkdf2(password: CryptoInput, options: KDFOptions): string | Buffer;
```

**Example:**
```javascript
const derivedKey = crypto.kdf.pbkdf2('user-password', {
  salt: 'random-salt-value',
  iterations: 100000,  // Minimum recommended
  keyLength: 32,       // 256 bits
  outputFormat: 'hex'
});

// With random salt
const salt = crypto.randomBytes(32);
const key = crypto.kdf.pbkdf2('password', {
  salt,
  iterations: 150000,  // Higher iterations for better security
  keyLength: 32
});
```

### Argon2

Modern password hashing function, winner of the Password Hashing Competition.

```typescript
interface Argon2Options extends KDFOptions {
  memoryCost?: number;    // Default: 4096 KB
  timeCost?: number;      // Default: 3
  parallelism?: number;   // Default: 1
  variant?: 'argon2i' | 'argon2d' | 'argon2id'; // Default: 'argon2id'
}

function argon2(password: CryptoInput, options: Argon2Options): string | Buffer;
```

#### Variants

**Argon2id** (Default, Recommended)
- Hybrid of Argon2i and Argon2d
- Resistant to both side-channel and time-memory trade-off attacks
- Best choice for most applications

**Argon2i**
- Optimized for side-channel resistance
- Good for scenarios where timing attacks are a concern
- Slightly slower than Argon2id

**Argon2d**
- Optimized for resistance against time-memory trade-off attacks
- Vulnerable to side-channel attacks
- Fastest variant but less secure

**Example:**
```javascript
// Argon2id (recommended)
const hash = crypto.kdf.argon2('user-password', {
  salt: 'unique-salt',
  timeCost: 3,       // Number of iterations
  memoryCost: 4096,  // 4MB memory usage
  parallelism: 1,    // Single thread
  variant: 'argon2id',
  keyLength: 32
});

// High-security settings
const secureHash = crypto.kdf.argon2('admin-password', {
  salt: crypto.randomBytes(32),
  timeCost: 5,       // More iterations
  memoryCost: 8192,  // 8MB memory usage
  parallelism: 2,    // Two threads
  variant: 'argon2id'
});
```

### bcrypt

Popular password hashing function, widely adopted in web applications.

```typescript
interface BcryptOptions {
  rounds?: number; // Default: 10, Range: 4-31
}

interface BcryptFunction {
  hash(password: CryptoInput, options?: BcryptOptions): string;
  verify(password: CryptoInput, hash: string): boolean;
}
```

**Example:**
```javascript
// Hash password
const hashedPassword = crypto.kdf.bcrypt.hash('user-password', {
  rounds: 12  // Higher rounds = more secure but slower
});

// Store hashedPassword in database...

// Later, verify password
const inputPassword = 'user-input';
const isValid = crypto.kdf.bcrypt.verify(inputPassword, hashedPassword);

if (isValid) {
  console.log('Password is correct');
} else {
  console.log('Invalid password');
}

// Different security levels
const fastHash = crypto.kdf.bcrypt.hash('password', { rounds: 10 });    // Fast
const secureHash = crypto.kdf.bcrypt.hash('password', { rounds: 14 });  // Very secure
```

## Error Handling

All functions throw descriptive errors for invalid inputs or operations.

### Common Error Types

**Invalid Input Type**
```javascript
try {
  crypto.hash.sha256(null); // TypeError
} catch (error) {
  console.error(error.message); // "Invalid input type"
}
```

**Invalid Key Length**
```javascript
try {
  crypto.cipher.aes.encrypt('data', {
    key: Buffer.alloc(10), // Invalid key length
    iv: Buffer.alloc(16)
  });
} catch (error) {
  console.error(error.message); // "Invalid key length for AES"
}
```

**Missing Required Parameters**
```javascript
try {
  crypto.hmac.sha256('data', {}); // Missing key
} catch (error) {
  console.error(error.message); // "HMAC key is required"
}
```

### Best Practices

```javascript
function safeHash(data) {
  try {
    return crypto.hash.sha256(data);
  } catch (error) {
    console.error('Hashing failed:', error.message);
    return null;
  }
}

function safeEncrypt(data, key, iv) {
  // Validate inputs
  if (!Buffer.isBuffer(key) || key.length !== 32) {
    throw new Error('Key must be 32 bytes for AES-256');
  }
  
  if (!Buffer.isBuffer(iv) || iv.length !== 16) {
    throw new Error('IV must be 16 bytes for AES');
  }
  
  try {
    return crypto.cipher.aes.encrypt(data, { key, iv });
  } catch (error) {
    console.error('Encryption failed:', error.message);
    throw error;
  }
}
```

## Performance Considerations

### Choosing Algorithms

**For Hashing:**
- **BLAKE3**: Fastest, excellent security
- **BLAKE2b**: Very fast, excellent security
- **SHA-256**: Standard choice, good performance
- **SHA3-256**: Latest standard, good performance

**For Password Hashing:**
- **Argon2id**: Best security, configurable performance
- **bcrypt**: Good security, widely supported
- **PBKDF2**: Legacy choice, still secure with high iterations

**For Encryption:**
- **AES-256-CBC**: Standard choice, excellent security
- **AES-256-CTR**: Better for streaming/parallel processing

### Memory Usage

```javascript
// Memory-efficient streaming for large data
function hashLargeFile(filePath) {
  const hasher = crypto.hash.blake3.create();
  const stream = fs.createReadStream(filePath);
  
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => hasher.update(chunk));
    stream.on('end', () => resolve(hasher.digest()));
    stream.on('error', reject);
  });
}
```

### Timing-Safe Comparisons

```javascript
// Always use timing-safe comparison for authentication
function verifyHmac(message, key, expectedHmac) {
  const computedHmac = crypto.hmac.sha256(message, { key });
  
  // Timing-safe comparison
  return crypto.timeSafeEqual(
    Buffer.from(computedHmac, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );
}
```

## Examples

### Complete Authentication System

```javascript
const crypto = require('cryptographer.js');
const nodeCrypto = require('crypto');

class AuthSystem {
  // Hash password for storage
  static hashPassword(password) {
    return crypto.kdf.argon2(password, {
      salt: nodeCrypto.randomBytes(32),
      timeCost: 3,
      memoryCost: 4096,
      variant: 'argon2id'
    });
  }
  
  // Verify password
  static verifyPassword(password, hash) {
    try {
      return crypto.kdf.bcrypt.verify(password, hash);
    } catch {
      return false;
    }
  }
  
  // Generate session token
  static generateSessionToken(userId) {
    const data = `${userId}:${Date.now()}`;
    const key = process.env.SESSION_SECRET;
    
    return crypto.hmac.sha256(data, { key });
  }
  
  // Encrypt sensitive data
  static encryptSensitiveData(data, userKey) {
    const iv = nodeCrypto.randomBytes(16);
    const key = crypto.kdf.pbkdf2(userKey, {
      salt: 'app-specific-salt',
      iterations: 100000,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    const encrypted = crypto.cipher.aes.encrypt(data, {
      key,
      iv,
      mode: 'CBC'
    });
    
    // Prepend IV to encrypted data
    return Buffer.concat([iv, encrypted]);
  }
  
  // Decrypt sensitive data
  static decryptSensitiveData(encryptedData, userKey) {
    const iv = encryptedData.slice(0, 16);
    const encrypted = encryptedData.slice(16);
    
    const key = crypto.kdf.pbkdf2(userKey, {
      salt: 'app-specific-salt',
      iterations: 100000,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    return crypto.cipher.aes.decrypt(encrypted, {
      key,
      iv,
      mode: 'CBC'
    });
  }
}
```

### File Integrity Verification

```javascript
const fs = require('fs');
const crypto = require('cryptographer.js');

class FileIntegrity {
  // Generate file checksum
  static async generateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hasher = crypto.hash.blake3.create();
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', chunk => hasher.update(chunk));
      stream.on('end', () => {
        const checksum = hasher.digest();
        resolve(checksum);
      });
      stream.on('error', reject);
    });
  }
  
  // Verify file integrity
  static async verifyFile(filePath, expectedChecksum) {
    const actualChecksum = await this.generateChecksum(filePath);
    return actualChecksum === expectedChecksum;
  }
  
  // Generate manifest file
  static async generateManifest(directory) {
    const files = fs.readdirSync(directory);
    const manifest = {};
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isFile()) {
        manifest[file] = await this.generateChecksum(filePath);
      }
    }
    
    return manifest;
  }
}
```

### Secure API Communication

```javascript
const crypto = require('cryptographer.js');

class SecureAPI {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }
  
  // Sign API request
  signRequest(method, url, body, timestamp) {
    const message = `${method}:${url}:${body}:${timestamp}`;
    return crypto.hmac.sha256(message, { 
      key: this.secretKey,
      outputFormat: 'base64'
    });
  }
  
  // Verify API request
  verifyRequest(method, url, body, timestamp, signature) {
    const expectedSignature = this.signRequest(method, url, body, timestamp);
    
    // Check timestamp freshness (5 minute window)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
      return false;
    }
    
    // Timing-safe comparison
    return crypto.timeSafeEqual(
      Buffer.from(expectedSignature, 'base64'),
      Buffer.from(signature, 'base64')
    );
  }
  
  // Encrypt API response
  encryptResponse(data) {
    const iv = crypto.randomBytes(16);
    const key = crypto.kdf.pbkdf2(this.secretKey, {
      salt: 'api-response-salt',
      iterations: 10000,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    const encrypted = crypto.cipher.aes.encrypt(JSON.stringify(data), {
      key,
      iv,
      mode: 'CBC'
    });
    
    return {
      iv: iv.toString('base64'),
      data: encrypted.toString('base64')
    };
  }
}
```

---

For more examples and advanced usage patterns, see the [main documentation](README.md) and [contributing guide](CONTRIBUTING.md).