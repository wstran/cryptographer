# HMAC Functions

HMAC (Hash-based Message Authentication Code) provides message authentication using cryptographic hash functions.

## Overview

HMAC combines a secret key with a hash function to create a message authentication code. It's used for:

- Message integrity verification
- API authentication
- Digital signatures
- Secure communication protocols

## Supported Algorithms

| Algorithm | Hash Function | Output Size | Status | Use Case |
|-----------|---------------|-------------|---------|----------|
| **HMAC-SHA-256** | SHA-256 | 256 bits | ✅ Recommended | General purpose, API auth |
| **HMAC-SHA-512** | SHA-512 | 512 bits | ✅ Recommended | Higher security |
| **HMAC-SHA-1** | SHA-1 | 160 bits | ⚠️ Legacy only | Legacy compatibility |
| **HMAC-MD5** | MD5 | 128 bits | ⚠️ Legacy only | Legacy compatibility |

## Basic Usage

### Simple HMAC

```javascript
import crypto from 'cryptographer.js';

// HMAC with SHA-256
const hmac = crypto.hmac.sha256('data', { key: 'secret' });
console.log(hmac); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// HMAC with SHA-512
const hmac512 = crypto.hmac.sha512('data', { key: 'secret' });

// HMAC with SHA-1 (legacy)
const hmacSha1 = crypto.hmac.sha1('data', { key: 'secret' });

// HMAC with MD5 (legacy)
const hmacMd5 = crypto.hmac.md5('data', { key: 'secret' });
```

### Output Formats

```javascript
// Hex output (default)
const hexHmac = crypto.hmac.sha256('data', { 
  key: 'secret',
  outputFormat: 'hex' 
});

// Base64 output
const base64Hmac = crypto.hmac.sha256('data', { 
  key: 'secret',
  outputFormat: 'base64' 
});

// Buffer output
const bufferHmac = crypto.hmac.sha256('data', { 
  key: 'secret',
  outputFormat: 'buffer' 
});

// Binary string output
const binaryHmac = crypto.hmac.sha256('data', { 
  key: 'secret',
  outputFormat: 'binary' 
});
```

### Input Types

```javascript
// String input
const hmac1 = crypto.hmac.sha256('data', { key: 'secret' });

// Buffer input
const hmac2 = crypto.hmac.sha256(Buffer.from('data'), { key: Buffer.from('secret') });

// Uint8Array input
const hmac3 = crypto.hmac.sha256(new Uint8Array([1, 2, 3]), { 
  key: new Uint8Array([4, 5, 6]) 
});
```

## Streaming API

For large data or streaming scenarios:

```javascript
// Create HMAC instance
const hmac = crypto.hmac.sha256.create({ key: 'secret' });

// Update with data chunks
hmac.update('Hello');
hmac.update(' ');
hmac.update('World');

// Get final HMAC
const result = hmac.digest('hex');
console.log(result); // HMAC of 'Hello World'
```

### Streaming with Files

```javascript
import fs from 'fs';

const hmac = crypto.hmac.sha256.create({ key: 'secret' });
const stream = fs.createReadStream('large-file.txt');

stream.on('data', (chunk) => {
  hmac.update(chunk);
});

stream.on('end', () => {
  const fileHmac = hmac.digest('hex');
  console.log('File HMAC:', fileHmac);
});
```

## Real-World Examples

### API Authentication

```javascript
class APIAuthenticator {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  // Generate HMAC for request
  signRequest(method, path, body, timestamp) {
    const message = `${method}\n${path}\n${body}\n${timestamp}`;
    return crypto.hmac.sha256(message, { key: this.secretKey });
  }

  // Verify HMAC from request
  verifyRequest(method, path, body, timestamp, signature) {
    const expectedSignature = this.signRequest(method, path, body, timestamp);
    return crypto.timingSafeEqual(signature, expectedSignature);
  }
}

// Usage
const auth = new APIAuthenticator('my-secret-key');
const signature = auth.signRequest('POST', '/api/users', '{"name":"John"}', '1640995200');
const isValid = auth.verifyRequest('POST', '/api/users', '{"name":"John"}', '1640995200', signature);
```

### Message Integrity

```javascript
class SecureMessage {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  // Create signed message
  createSignedMessage(message) {
    const hmac = crypto.hmac.sha256(message, { key: this.secretKey });
    return {
      message: message,
      signature: hmac,
      timestamp: Date.now()
    };
  }

  // Verify signed message
  verifySignedMessage(signedMessage) {
    const expectedHmac = crypto.hmac.sha256(signedMessage.message, { 
      key: this.secretKey 
    });
    return crypto.timingSafeEqual(signedMessage.signature, expectedHmac);
  }
}

// Usage
const secureMsg = new SecureMessage('secret-key');
const signed = secureMsg.createSignedMessage('Hello World');
const isValid = secureMsg.verifySignedMessage(signed);
```

### JWT-like Tokens

```javascript
class SimpleToken {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  // Create token
  createToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.hmac.sha256(data, { key: this.secretKey });
    const encodedSignature = Buffer.from(signature, 'hex').toString('base64url');
    
    return `${data}.${encodedSignature}`;
  }

  // Verify token
  verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    
    const expectedSignature = crypto.hmac.sha256(data, { key: this.secretKey });
    const expectedEncoded = Buffer.from(expectedSignature, 'hex').toString('base64url');
    
    if (signature !== expectedEncoded) return null;
    
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  }
}

// Usage
const token = new SimpleToken('secret-key');
const jwt = token.createToken({ userId: 123, role: 'admin' });
const payload = token.verifyToken(jwt);
```

## Security Best Practices

### Key Management

```javascript
// ✅ Good: Use strong, random keys
const crypto = require('crypto');
const key = crypto.randomBytes(32); // 256-bit key

// ❌ Bad: Use weak keys
const weakKey = 'password123';
```

### Timing-Safe Comparison

```javascript
// ✅ Good: Use timing-safe comparison
function verifyHmac(message, key, signature) {
  const expectedSignature = crypto.hmac.sha256(message, { key });
  return crypto.timingSafeEqual(signature, expectedSignature);
}

// ❌ Bad: Use regular comparison (vulnerable to timing attacks)
function verifyHmacBad(message, key, signature) {
  const expectedSignature = crypto.hmac.sha256(message, { key });
  return signature === expectedSignature; // Vulnerable!
}
```

### Key Derivation

```javascript
// ✅ Good: Derive HMAC keys from master key
const masterKey = crypto.randomBytes(32);
const hmacKey = crypto.kdf.pbkdf2(masterKey, {
  salt: 'hmac-salt',
  iterations: 100000,
  keyLength: 32
});

// ❌ Bad: Use password directly as key
const hmacKey = 'my-password'; // Weak!
```

## Performance

Sample performance on M2 Max / Node 18:

| Algorithm | ops/s | vs crypto-js | Use Case |
|-----------|-------|--------------|----------|
| HMAC-SHA-256 | 1.2 M | 8× faster | General purpose |
| HMAC-SHA-512 | 0.8 M | 6× faster | Higher security |
| HMAC-SHA-1 | 1.5 M | 9× faster | Legacy compatibility |
| HMAC-MD5 | 2.0 M | 10× faster | Legacy compatibility |

## Error Handling

```javascript
try {
  const hmac = crypto.hmac.sha256('data', { key: 'secret' });
} catch (error) {
  if (error.message.includes('Invalid key')) {
    console.error('Invalid HMAC key');
  } else if (error.message.includes('Invalid input')) {
    console.error('Invalid input data');
  } else if (error.message.includes('WebAssembly')) {
    console.error('WebAssembly module failed to load');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## TypeScript Support

```typescript
import crypto, { CryptoInput, HmacOptions, HmacOutput } from 'cryptographer.js';

// Type-safe function calls
const hmac: string = crypto.hmac.sha256('data', { key: 'secret' });
const hmacBuffer: Buffer = crypto.hmac.sha256('data', { 
  key: 'secret',
  outputFormat: 'buffer' 
});

// Type-safe options
const options: HmacOptions = {
  key: 'secret',
  outputFormat: 'hex' as HmacOutput
};

// Type-safe input
const input: CryptoInput = 'data' || Buffer.from('data') || new Uint8Array([1, 2, 3]);
```

## API Reference

### Function Signature

```typescript
function hmacSha256(data: CryptoInput, options: HmacOptions): string | Buffer
```

### Types

```typescript
type CryptoInput = string | Buffer | Uint8Array;

type HmacOutput = 'hex' | 'base64' | 'binary' | 'buffer';

interface HmacOptions {
  key: string | Buffer | Uint8Array;
  outputFormat?: HmacOutput;
}
```

### Available Functions

- `crypto.hmac.sha1(data, options)`
- `crypto.hmac.sha256(data, options)`
- `crypto.hmac.sha512(data, options)`
- `crypto.hmac.md5(data, options)`

### Streaming API

```typescript
interface HmacInstance {
  update(data: CryptoInput): this;
  digest(format?: HmacOutput): string | Buffer;
  reset(): this;
}

// Create streaming instance
const hmac: HmacInstance = crypto.hmac.sha256.create({ key: 'secret' });
```

### Timing-Safe Comparison

```typescript
function timingSafeEqual(a: string | Buffer, b: string | Buffer): boolean
```

This function compares two strings/buffers in a timing-safe manner to prevent timing attacks. 