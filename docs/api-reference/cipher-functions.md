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
| **AES-128** | 128 bits | GCM, CCM, CTR, SIV, (CBC/ECB mapped) | ✅ Recommended | General purpose |
| **AES-192** | 192 bits | GCM, CCM, CTR, (CBC/ECB mapped) | ✅ Recommended | Higher security |
| **AES-256** | 256 bits | GCM, CCM, CTR, SIV, (CBC/ECB mapped) | ✅ Recommended | Maximum security |
| **ChaCha20** | 256 bits | CTR (nonce=12B), AEAD | ✅ Recommended | Performance/portable |
| **ChaCha20-Poly1305** | 256 bits | AEAD | ✅ Recommended | Authenticated encryption |
| DES | 56-bit | CBC, CTR | ❌ Legacy (avoid) | Interop only |
| 3DES (EDE3) | 168-bit | CBC, CTR | ⚠️ Legacy (avoid) | Interop only |

### Public-Key (Key Exchange & Asymmetric Encryption)

| Algorithm | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| RSA-OAEP (SHA-256 default) | Asymmetric encryption (small payloads) | ✅ Recommended | Use to encrypt keys, not large data |
| X25519 | Key agreement (ECDH over Curve25519) | ✅ Recommended | Modern, fast, safe defaults |
| ECDH secp256r1/P-384 | Key agreement | ✅ Recommended | Widely supported, choose curve per compliance |

#### RSA-OAEP usage and limits
- Key formats: Public (SPKI/PKCS#1 DER), Private (PKCS#8/PKCS#1 DER)
- Hash options: 'sha1' | 'sha256' | 'sha384' | 'sha512' (default: 'sha256')
- OAEP label: optional; if used, must match on decrypt
- Max plaintext: For modulus size k (bytes) and hash hLen (bytes): max = k - 2*hLen - 2
  - Example: 2048-bit (k=256) with SHA-256 (hLen=32) → 190 bytes

```javascript
import crypto from 'cryptographer.js';
import fs from 'fs';

const pub = fs.readFileSync('public_key.der');
const prv = fs.readFileSync('private_key.der');

// Wrap a random 32-byte key
import { randomBytes } from 'crypto';
const dataKey = randomBytes(32);
const wrapped = crypto.rsa_oaep.encrypt(dataKey, pub, { hash: 'sha256' });
const unwrapped = crypto.rsa_oaep.decrypt(wrapped, prv, { hash: 'sha256' });
```

#### X25519 usage
- Generate keypair and derive shared secret; then HKDF → symmetric key
```javascript
import { hkdfSync } from 'crypto';
// Each keypair returns 32B secret + 32B public key
const a = crypto.x25519.generateKeypair();
const b = crypto.x25519.generateKeypair();
// Each side derives the same shared secret
const ssA = crypto.x25519.deriveSharedSecret(a.privateKey, b.publicKey);
const ssB = crypto.x25519.deriveSharedSecret(b.privateKey, a.publicKey);
const keyA = hkdfSync('sha256', ssA, Buffer.alloc(0), Buffer.from('x25519 hkdf'), 32);
const keyB = hkdfSync('sha256', ssB, Buffer.alloc(0), Buffer.from('x25519 hkdf'), 32);
```

#### ECDH secp256r1/P-384 usage
- Choose curve per compliance/perf; keys uncompressed: secp256r1 (pub 65B), P-384 (pub 97B)
```javascript
import { hkdfSync } from 'crypto';
// P-256 (aka secp256r1). Public key is uncompressed SEC1 (65 bytes)
const e1 = crypto.ecdh.generateKeypair('p256');
const e2 = crypto.ecdh.generateKeypair('p256');
const s1 = crypto.ecdh.deriveSharedSecret('p256', e1.privateKey, e2.publicKey);
const s2 = crypto.ecdh.deriveSharedSecret('p256', e2.privateKey, e1.publicKey);
const k1 = hkdfSync('sha256', s1, Buffer.alloc(0), Buffer.from('ecdh secp256r1 hkdf'), 32);
const k2 = hkdfSync('sha256', s2, Buffer.alloc(0), Buffer.from('ecdh secp256r1 hkdf'), 32);
```

## Basic Usage

### AES: Simple Encryption/Decryption (GCM)

```javascript
import crypto from 'cryptographer.js';

// Generate secure key and IV
import { randomBytes } from 'crypto';
const key = randomBytes(32); // 32 bytes for AES-256
const iv = randomBytes(12);  // 12 bytes nonce for AES-GCM

// Encrypt (AES-GCM)
const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key: key,
  iv: iv,
  mode: 'gcm'
});

// Decrypt data
const decrypted = crypto.cipher.aes.decrypt(encrypted, {
  key: key,
  iv: iv,
  mode: 'gcm'
});

console.log(decrypted.toString()); // 'Hello World'
```

### Different Key Sizes

```javascript
// AES-128 (16 bytes key)
const key128 = randomBytes(16);
const encrypted128 = crypto.cipher.aes.encrypt('data', { key: key128, iv });

// AES-192 (24 bytes key)
const key192 = randomBytes(24);
const encrypted192 = crypto.cipher.aes.encrypt('data', { key: key192, iv });

// AES-256 (32 bytes key)
const key256 = randomBytes(32);
const encrypted256 = crypto.cipher.aes.encrypt('data', { key: key256, iv });
```

### AES: Different Modes
```javascript
import { randomBytes } from 'crypto';
const key = randomBytes(32);

// GCM (AEAD) - recommended, 12-byte nonce
const n12 = randomBytes(12);
const encG = crypto.cipher.aes.encrypt('data', { key, iv: n12, mode: 'gcm' });
const decG = crypto.cipher.aes.decrypt(encG, { key, iv: n12, mode: 'gcm' });

// CTR - 16-byte IV
const n16 = randomBytes(16);
const encCtr = crypto.cipher.aes.encrypt('data', { key, iv: n16, mode: 'ctr' });
const decCtr = crypto.cipher.aes.decrypt(encCtr, { key, iv: n16, mode: 'ctr' });

// CCM (AEAD) - 13-byte nonce
const n13 = randomBytes(13);
const encCcm = crypto.cipher.aes.encrypt('data', { key, iv: n13, mode: 'ccm' });
const decCcm = crypto.cipher.aes.decrypt(encCcm, { key, iv: n13, mode: 'ccm' });

// SIV (misuse-resistant AEAD) - 16-byte nonce, 32B or 64B key
const sivKey = randomBytes(32);
const encSiv = crypto.cipher.aes.encrypt('data', { key: sivKey, iv: n16, mode: 'siv' });
const decSiv = crypto.cipher.aes.decrypt(encSiv, { key: sivKey, iv: n16, mode: 'siv' });
```
### ChaCha20 / ChaCha20-Poly1305

```javascript
import crypto from 'cryptographer.js';
import { randomBytes } from 'crypto';
const key = randomBytes(32); // 32 bytes
const nonce = randomBytes(12); // 12 bytes

// Stream cipher (CTR-like)
const enc = crypto.cipher.chacha20.encrypt('hello', { key, iv: nonce, mode: 'ctr' });
const dec = crypto.cipher.chacha20.decrypt(enc, { key, iv: nonce, mode: 'ctr' });

// Authenticated encryption (maps to AEAD). Use 'cbc' mode selector to request AEAD internally.
const aeadNonce = randomBytes(12);
const ct = crypto.cipher.chacha20.encrypt('secret', { key, iv: aeadNonce, mode: 'cbc' });
const pt = crypto.cipher.chacha20.decrypt(ct, { key, iv: aeadNonce, mode: 'cbc' });
```

Notes:
- AES-GCM nonce must be 12 bytes; AES-CCM nonce must be 13 bytes; AES-SIV nonce must be 16 bytes.
- CBC/ECB selectors are maintained for compatibility and internally map to AEAD/CTR.

### DES / 3DES (Legacy)

```javascript
import { randomBytes } from 'crypto';
// DES (8-byte key) or 3DES (24-byte key). IV must be 8 bytes for CBC/CTR.
const keyDES = randomBytes(8);
const key3DES = randomBytes(24);
const iv8 = randomBytes(8);

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
import { randomBytes } from 'crypto';

class FileEncryptor {
  constructor(key) {
    this.key = key;
  }

  // Encrypt file
  encryptFile(inputPath, outputPath) {
    const data = fs.readFileSync(inputPath);
    const iv = randomBytes(16);

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
const key = randomBytes(32);
const encryptor = new FileEncryptor(key);
encryptor.encryptFile('input.txt', 'encrypted.bin');
encryptor.decryptFile('encrypted.bin', 'decrypted.txt');
```

### Streaming Encryption

```javascript
import { Transform } from 'stream';
import { randomBytes } from 'crypto';

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
const key = randomBytes(32);
const iv = randomBytes(16);

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
import { randomBytes } from 'crypto';

class SecureChannel {
  constructor(sharedKey) {
    this.key = sharedKey;
  }

  // Encrypt message with integrity
  encryptMessage(message, additionalData = '') {
    const iv = randomBytes(16);
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
const key = randomBytes(32);
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

- **AES-GCM**: 12-byte nonce (required)
- **AES-CCM**: 13-byte nonce (required)
- **AES-SIV**: 16-byte nonce (required). Key must be 32B (AES-128-SIV) or 64B (AES-256-SIV)
- **AES-CTR**: 16-byte IV
- **AES-CBC**: Use GCM instead; if specified, mapped to GCM internally (nonce 12B)
- **ChaCha20**: 12-byte nonce (required)
- **ChaCha20-Poly1305**: 12-byte nonce (required)
- **DES/3DES CBC/CTR**: 8-byte IV/nonce
- **ECB**: No IV (internally emulated using CTR with zero IV; avoid)

### Block Size

- AES block size: 16 bytes (applies to CTR/CBC). AEAD modes (GCM/CCM/SIV) are message-oriented with tags.