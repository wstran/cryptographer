# Cipher Functions

cryptographer.js provides AES, ChaCha20, and legacy DES/3DES encryption and decryption with multiple modes of operation.

## Overview

Cipher functions provide symmetric encryption and decryption. They're used for:

- Data encryption at rest
- Secure communication
- File encryption
- Database encryption
- API payload encryption

## Supported Algorithms

| Algorithm | Key Sizes | Modes | Status | Use Case |
|-----------|-----------|-------|--------|----------|
| **AES-128** | 128 bits | CBC, ECB, CTR | ✅ Recommended | General purpose |
| **AES-192** | 192 bits | CBC, ECB, CTR | ✅ Recommended | Higher security |
| **AES-256** | 256 bits | CBC, ECB, CTR | ✅ Recommended | Maximum security |
| **ChaCha20** | 256 bits | CTR (nonce=12B), AEAD | ✅ Recommended | Performance/portable |
| **ChaCha20-Poly1305** | 256 bits | AEAD | ✅ Recommended | Authenticated encryption |
| DES | 56-bit | CBC, CTR | ❌ Legacy (avoid) | Interop only |
| 3DES (EDE3) | 168-bit | CBC, CTR | ⚠️ Legacy (avoid) | Interop only |

## Basic Usage

### AES: Simple Encryption/Decryption

```javascript
import crypto from 'cryptographer.js';

// Generate secure key and IV
const crypto = require('crypto');
const key = crypto.randomBytes(32); // 32 bytes for AES-256
const iv = crypto.randomBytes(16);  // 16 bytes for AES

// Encrypt data
const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key: key,
  iv: iv,
  mode: 'cbc' // CBC, ECB, or CTR
});

// Decrypt data
const decrypted = crypto.cipher.aes.decrypt(encrypted, {
  key: key,
  iv: iv,
  mode: 'cbc'
});

console.log(decrypted.toString()); // 'Hello World'
```

### Different Key Sizes

```javascript
// AES-128 (16 bytes key)
const key128 = crypto.randomBytes(16);
const encrypted128 = crypto.cipher.aes.encrypt('data', { key: key128, iv });

// AES-192 (24 bytes key)
const key192 = crypto.randomBytes(24);
const encrypted192 = crypto.cipher.aes.encrypt('data', { key: key192, iv });

// AES-256 (32 bytes key)
const key256 = crypto.randomBytes(32);
const encrypted256 = crypto.cipher.aes.encrypt('data', { key: key256, iv });
```

### AES: Different Modes
### ChaCha20 / ChaCha20-Poly1305

```javascript
import crypto from 'cryptographer.js';
const key = crypto.randomBytes(32); // 32 bytes
const nonce = crypto.randomBytes(12); // 12 bytes

// Stream cipher (CTR-like)
const enc = crypto.cipher.chacha20.encrypt('hello', { key, iv: nonce, mode: 'ctr' });
const dec = crypto.cipher.chacha20.decrypt(enc, { key, iv: nonce, mode: 'ctr' });

// Authenticated encryption (maps to AEAD). Use 'cbc' mode selector to request AEAD internally.
const aeadNonce = crypto.randomBytes(12);
const ct = crypto.cipher.chacha20.encrypt('secret', { key, iv: aeadNonce, mode: 'cbc' });
const pt = crypto.cipher.chacha20.decrypt(ct, { key, iv: aeadNonce, mode: 'cbc' });
```

Notes:
- For ChaCha20: nonce must be 12 bytes. Avoid nonce reuse.
- For ChaCha20-Poly1305 AEAD: we map `mode: 'cbc'` to AEAD under the hood to keep the same API.

### DES / 3DES (Legacy)

```javascript
// DES (8-byte key) or 3DES (24-byte key). IV must be 8 bytes for CBC/CTR.
const keyDES = crypto.randomBytes(8);
const key3DES = crypto.randomBytes(24);
const iv8 = crypto.randomBytes(8);

// DES CBC
const encDes = crypto.cipher.des.encrypt('data', { key: keyDES, iv: iv8, mode: 'cbc' });
const decDes = crypto.cipher.des.decrypt(encDes, { key: keyDES, iv: iv8, mode: 'cbc' });

// 3DES CTR
const enc3 = crypto.cipher.des.encrypt('data', { key: key3DES, iv: iv8, mode: 'ctr' });
const dec3 = crypto.cipher.des.decrypt(enc3, { key: key3DES, iv: iv8, mode: 'ctr' });
```

Warning: DES/3DES are considered deprecated and should not be used for new systems.

```javascript
// CBC mode (Cipher Block Chaining) - recommended
const encryptedCBC = crypto.cipher.aes.encrypt('data', {
  key: key,
  iv: iv,
  mode: 'cbc'
});

// ECB mode (Electronic Codebook) - not recommended for most use cases
const encryptedECB = crypto.cipher.aes.encrypt('data', {
  key: key,
  mode: 'ecb' // No IV needed
});

// CTR mode (Counter) - good for parallel processing
const encryptedCTR = crypto.cipher.aes.encrypt('data', {
  key: key,
  iv: iv, // Used as nonce in CTR mode
  mode: 'ctr'
});
```

## Advanced Usage

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
  }
}

// Usage
const key = crypto.randomBytes(32);
const encryptor = new FileEncryptor(key);
encryptor.encryptFile('input.txt', 'encrypted.bin');
encryptor.decryptFile('encrypted.bin', 'decrypted.txt');
```

### Streaming Encryption

```javascript
import { Transform } from 'stream';

class AESStream extends Transform {
  constructor(key, iv, mode = 'cbc', encrypt = true) {
    super();
    this.key = key;
    this.iv = iv;
    this.mode = mode;
    this.encrypt = encrypt;
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    // Process complete blocks (AES block size is 16 bytes)
    while (this.buffer.length >= 16) {
      const block = this.buffer.slice(0, 16);
      this.buffer = this.buffer.slice(16);

      let result;
      if (this.encrypt) {
        result = crypto.cipher.aes.encrypt(block, {
          key: this.key,
          iv: this.iv,
          mode: this.mode
        });
      } else {
        result = crypto.cipher.aes.decrypt(block, {
          key: this.key,
          iv: this.iv,
          mode: this.mode
        });
      }

      this.push(result);
    }

    callback();
  }

  _flush(callback) {
    // Handle remaining data with padding
    if (this.buffer.length > 0) {
      // PKCS7 padding
      const padding = 16 - this.buffer.length;
      const padded = Buffer.concat([
        this.buffer,
        Buffer.alloc(padding, padding)
      ]);

      let result;
      if (this.encrypt) {
        result = crypto.cipher.aes.encrypt(padded, {
          key: this.key,
          iv: this.iv,
          mode: this.mode
        });
      } else {
        result = crypto.cipher.aes.decrypt(padded, {
          key: this.key,
          iv: this.iv,
          mode: this.mode
        });
      }

      this.push(result);
    }

    callback();
  }
}

// Usage
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Encrypt stream
const encryptStream = new AESStream(key, iv, 'cbc', true);
const decryptStream = new AESStream(key, iv, 'cbc', false);

fs.createReadStream('input.txt')
  .pipe(encryptStream)
  .pipe(fs.createWriteStream('encrypted.bin'));

fs.createReadStream('encrypted.bin')
  .pipe(decryptStream)
  .pipe(fs.createWriteStream('decrypted.txt'));
```

### Secure Communication Protocol

```javascript
class SecureChannel {
  constructor(sharedKey) {
    this.key = sharedKey;
  }

  // Encrypt message with integrity
  encryptMessage(message, additionalData = '') {
    const iv = crypto.randomBytes(16);
    const messageBuffer = Buffer.from(message, 'utf8');

    // Encrypt message
    const encrypted = crypto.cipher.aes.encrypt(messageBuffer, {
      key: this.key,
      iv: iv,
      mode: 'cbc'
    });

    // Create HMAC for integrity
    const hmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted, Buffer.from(additionalData)]), {
      key: this.key
    });

    return {
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      hmac: hmac,
      additionalData: additionalData
    };
  }

  // Decrypt and verify message
  decryptMessage(packet) {
    const iv = Buffer.from(packet.iv, 'hex');
    const encrypted = Buffer.from(packet.encrypted, 'hex');

    // Verify HMAC
    const expectedHmac = crypto.hmac.sha256(
      Buffer.concat([iv, encrypted, Buffer.from(packet.additionalData || '')]),
      { key: this.key }
    );

    if (packet.hmac !== expectedHmac) {
      throw new Error('Message integrity check failed');
    }

    // Decrypt message
    const decrypted = crypto.cipher.aes.decrypt(encrypted, {
      key: this.key,
      iv: iv,
      mode: 'cbc'
    });

    return decrypted.toString('utf8');
  }
}

// Usage
const key = crypto.randomBytes(32);
const channel = new SecureChannel(key);

const encrypted = channel.encryptMessage('Hello World', 'user123');
const decrypted = channel.decryptMessage(encrypted);
console.log(decrypted); // 'Hello World'
```

## Security Best Practices

### Key Management

```javascript
// ✅ Good: Generate strong, random keys
const key = crypto.randomBytes(32); // 256-bit key

// ❌ Bad: Use weak keys
const weakKey = Buffer.from('password123', 'utf8');
```

### IV Management

```javascript
// ✅ Good: Use random IV for each encryption
const iv = crypto.randomBytes(16);
const encrypted = crypto.cipher.aes.encrypt(data, { key, iv });

// ❌ Bad: Use fixed IV
const fixedIv = Buffer.alloc(16, 0);
const encrypted = crypto.cipher.aes.encrypt(data, { key, iv: fixedIv });
```

### Mode Selection

```javascript
// ✅ Good: Use CBC mode for most cases
const encrypted = crypto.cipher.aes.encrypt(data, {
  key: key,
  iv: iv,
  mode: 'cbc'
});

// ⚠️ Use CTR mode for parallel processing
const encrypted = crypto.cipher.aes.encrypt(data, {
  key: key,
  iv: iv, // Used as nonce
  mode: 'ctr'
});

// ❌ Avoid ECB mode (except for specific use cases)
const encrypted = crypto.cipher.aes.encrypt(data, {
  key: key,
  mode: 'ecb' // No IV needed, but less secure
});
```

### Authenticated Encryption

```javascript
// ✅ Good: Combine encryption with HMAC for integrity
function encryptWithAuth(data, key) {
  const iv = crypto.randomBytes(16);
  const encrypted = crypto.cipher.aes.encrypt(data, { key, iv, mode: 'cbc' });
  const hmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), { key });

  return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex'), hmac };
}

function decryptWithAuth(packet, key) {
  const iv = Buffer.from(packet.iv, 'hex');
  const encrypted = Buffer.from(packet.encrypted, 'hex');

  // Verify HMAC first
  const expectedHmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), { key });
  if (packet.hmac !== expectedHmac) {
    throw new Error('Integrity check failed');
  }

  return crypto.cipher.aes.decrypt(encrypted, { key, iv, mode: 'cbc' });
}
```

## Performance

Sample performance on M2 Max / Node 18:

| Algorithm | Mode | ops/s | vs crypto-js | Use Case |
|-----------|------|-------|--------------|----------|
| AES-256 | CBC | 0.9 M | 9× faster | General purpose |
| AES-256 | CTR | 1.1 M | 10× faster | Parallel processing |
| AES-256 | ECB | 1.2 M | 11× faster | Specific use cases |
| AES-128 | CBC | 1.3 M | 12× faster | Standard security |
| AES-192 | CBC | 1.0 M | 9× faster | Higher security |

## Error Handling

```javascript
try {
  const encrypted = crypto.cipher.aes.encrypt(data, { key, iv });
} catch (error) {
  if (error.message.includes('Invalid key length')) {
    console.error('Invalid AES key length');
  } else if (error.message.includes('Invalid IV length')) {
    console.error('Invalid IV length (must be 16 bytes)');
  } else if (error.message.includes('Invalid mode')) {
    console.error('Invalid encryption mode');
  } else if (error.message.includes('WebAssembly')) {
    console.error('WebAssembly module failed to load');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## TypeScript Support

```typescript
import crypto, { CryptoInput, CipherOptions, CipherMode } from 'cryptographer.js';

// Type-safe function calls
const encrypted: Buffer = crypto.cipher.aes.encrypt('data', { key, iv });
const decrypted: Buffer = crypto.cipher.aes.decrypt(encrypted, { key, iv });

// Type-safe options
const options: CipherOptions = {
  key: Buffer.from('key'),
  iv: Buffer.from('iv'),
  mode: 'cbc' as CipherMode
};

// Type-safe input
const input: CryptoInput = 'data' || Buffer.from('data') || new Uint8Array([1, 2, 3]);
```

## API Reference

### Function Signature

```typescript
function encrypt(data: CryptoInput, options: CipherOptions): Buffer
function decrypt(data: Buffer, options: CipherOptions): Buffer
```

### Types

```typescript
type CryptoInput = string | Buffer | Uint8Array;

type CipherMode = 'cbc' | 'ecb' | 'ctr';

interface CipherOptions {
  key: Buffer;
  iv?: Buffer; // Required for CBC and CTR modes
  mode?: CipherMode; // Default: 'cbc'
}
```

### Available Functions

- `crypto.cipher.aes.encrypt(data, options)` / `decrypt`
- `crypto.cipher.chacha20.encrypt(data, options)` / `decrypt`
- `crypto.cipher.des.encrypt(data, options)` / `decrypt`

### Key Sizes

- **AES-128**: 16 bytes key
- **AES-192**: 24 bytes key
- **AES-256**: 32 bytes key

### IV/Nonce Sizes

- **AES CBC/CTR**: 16 bytes IV/nonce
- **ChaCha20**: 12 bytes nonce (required)
- **ChaCha20-Poly1305**: 12 bytes nonce (required)
- **DES/3DES CBC/CTR**: 8 bytes IV/nonce
- **ECB modes**: No IV required (emulated via CTR with zero IV; avoid for security)

### Block Size

All AES modes use 16-byte blocks internally.