# Hash Functions

cryptographer.js provides a comprehensive set of hash functions, from legacy algorithms to modern, high-performance options.

## Overview

Hash functions take arbitrary data and produce a fixed-size output (digest). They are used for:

- Data integrity verification
- Digital signatures
- Password hashing (with KDF functions)
- Checksums
- Deduplication

## Supported Algorithms

| Algorithm | Output Size | Standard | Status | Use Case |
|-----------|-------------|----------|---------|----------|
| **SHA-256** | 256 bits | FIPS 180-4 | ✅ Recommended | General purpose, digital signatures |
| **SHA-512** | 512 bits | FIPS 180-4 | ✅ Recommended | Higher security, digital signatures |
| **SHA3-256** | 256 bits | FIPS 202 | ✅ Recommended | Latest standard, future-proof |
| **SHA3-512** | 512 bits | FIPS 202 | ✅ Recommended | Latest standard, higher security |
| **BLAKE2b** | 512 bits | RFC 7693 | ✅ Recommended | Fast, secure, general purpose |
| **BLAKE2s** | 256 bits | RFC 7693 | ✅ Recommended | Optimized for 8-32 bit platforms |
| **BLAKE3** | 256 bits | - | ✅ Recommended | Extremely fast, secure |
| **SHA-1** | 160 bits | RFC 3174 | ⚠️ Legacy only | Legacy compatibility |
| **MD5** | 128 bits | RFC 1321 | ⚠️ Legacy only | Legacy compatibility |
| **MD4** | 128 bits | RFC 1320 | ⚠️ Legacy only | Legacy compatibility |
| **Whirlpool** | 512 bits | ISO/IEC 10118-3 | ✅ Supported | 512-bit hash function |
| **RIPEMD-160** | 160 bits | - | ✅ Supported | Bitcoin, cryptocurrencies |

## Basic Usage

### Simple Hash

```javascript
import crypto from 'cryptographer.js';

// SHA-256 hash
const hash = crypto.sha.sha256('Hello World');
console.log(hash); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// SHA-512 hash
const hash512 = crypto.sha.sha512('Hello World');

// BLAKE3 hash (faster)
const blake3Hash = crypto.sha.blake3('Hello World');
```

### Output Formats

```javascript
// Hex output (default)
const hexHash = crypto.sha.sha256('Hello World', { outputFormat: 'hex' });

// Base64 output
const base64Hash = crypto.sha.sha256('Hello World', { outputFormat: 'base64' });

// Buffer output
const bufferHash = crypto.sha.sha256('Hello World', { outputFormat: 'buffer' });

// Binary string output
const binaryHash = crypto.sha.sha256('Hello World', { outputFormat: 'binary' });
```

### Input Types

```javascript
// String input
const hash1 = crypto.sha.sha256('Hello World');

// Buffer input
const hash2 = crypto.sha.sha256(Buffer.from('Hello World', 'utf8'));

// Uint8Array input
const hash3 = crypto.sha.sha256(new Uint8Array([72, 101, 108, 108, 111]));
```

## Streaming API

For large files or data streams, use the streaming API:

```javascript
// Create hash instance
const hash = crypto.sha.sha256.create();

// Update with data chunks
hash.update('Hello');
hash.update(' ');
hash.update('World');

// Get final digest
const result = hash.digest('hex');
console.log(result); // SHA-256 hash of 'Hello World'
```

### Streaming with Files

```javascript
import fs from 'fs';

const hash = crypto.sha.sha256.create();
const stream = fs.createReadStream('large-file.txt');

stream.on('data', (chunk) => {
  hash.update(chunk);
});

stream.on('end', () => {
  const fileHash = hash.digest('hex');
  console.log('File hash:', fileHash);
});
```

## Algorithm-Specific Functions

### SHA Family

```javascript
// SHA-1 (legacy)
const sha1Hash = crypto.sha.sha1('data');

// SHA-256 (recommended)
const sha256Hash = crypto.sha.sha256('data');

// SHA-512 (higher security)
const sha512Hash = crypto.sha.sha512('data');

// SHA3-256 (latest standard)
const sha3_256Hash = crypto.sha.sha3_256('data');

// SHA3-512 (latest standard, higher security)
const sha3_512Hash = crypto.sha.sha3_512('data');
```

### BLAKE Family

```javascript
// BLAKE2b (512-bit output)
const blake2bHash = crypto.sha.blake2b('data');

// BLAKE2s (256-bit output, optimized for small platforms)
const blake2sHash = crypto.sha.blake2s('data');

// BLAKE3 (256-bit output by default, extremely fast)
const blake3Hash = crypto.sha.blake3('data');

// BLAKE3 — keyed hashing (MAC-like)
const keyed = crypto.sha.blake3('data', { keyed: Buffer.from('0123456789abcdef0123456789abcdef', 'hex') }); // 32 bytes key

// BLAKE3 — derive-key mode (deterministic subkeys)
const dk = crypto.sha.blake3('data', { deriveKey: 'com.example.app.key' });

// BLAKE3 — extendable output (XOF) length in bytes
const xof32 = crypto.sha.blake3('data', { hashLength: 32 }); // 32 bytes output
```

### Legacy Algorithms

```javascript
// MD4 (legacy, cryptographically broken)
const md4Hash = crypto.sha.md4('data');

// MD5 (legacy, cryptographically broken)
const md5Hash = crypto.sha.md5('data');

// SHA-1 (legacy, cryptographically broken)
const sha1Hash = crypto.sha.sha1('data');
```

### Specialized Algorithms

```javascript
// Whirlpool (512-bit hash)
const whirlpoolHash = crypto.sha.whirlpool('data');

// RIPEMD-160 (160-bit hash, used in Bitcoin)
const ripemd160Hash = crypto.sha.ripemd160('data');
```

## Performance Comparison

Sample performance (Linux x64 / Node 20; higher = better):

Note: crypto-js does not implement BLAKE2b/BLAKE2s/BLAKE3. Mark these "vs crypto-js" as N/A.

| Algorithm | ops/s | vs crypto-js | Use Case |
|-----------|-------|--------------|----------|
| BLAKE3 | 0.010 M | N/A | General purpose, speed critical |
| BLAKE2b | 0.66 M | N/A | General purpose, high security |
| BLAKE2s | 0.65 M | N/A | Optimized for small platforms |
| SHA-256 | 0.54 M | 3.3× faster | Digital signatures, compatibility |
| SHA-512 | 0.59 M | 16× faster | Higher security requirements |
| SHA3-256 | 0.55 M | 33.5× faster | Latest standard, future-proof |

## Security Considerations

### Algorithm Selection

```javascript
// ✅ Recommended for new applications
const hash = crypto.sha.sha256(data);     // General purpose
const hash = crypto.sha.blake3(data);     // Speed critical
const hash = crypto.sha.sha3_256(data);   // Future-proof

// ⚠️ Use only for legacy compatibility
const hash = crypto.sha.sha1(data);       // Cryptographically broken
const hash = crypto.sha.md5(data);        // Cryptographically broken
const hash = crypto.sha.md4(data);        // Cryptographically broken
```

### Salt and Pepper

For password hashing, use KDF functions instead:

```javascript
// ❌ Don't use hash functions for passwords
const passwordHash = crypto.sha.sha256(password);

// ✅ Use KDF functions for passwords
const passwordHash = crypto.kdf.argon2(password, options);
```

### Length Extension Attacks

Some hash functions are vulnerable to length extension attacks:

```javascript
// SHA-256, MD5, SHA-1 are vulnerable
const hash = crypto.sha.sha256(data);

// SHA3 family is resistant
const hash = crypto.sha.sha3_256(data);
```

## Error Handling

```javascript
try {
  const hash = crypto.sha.sha256(data);
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

## TypeScript Support

```typescript
import crypto, { CryptoInput, HashOptions, HashOutput } from 'cryptographer.js';

// Type-safe function calls
const hash: string = crypto.sha.sha256('data');
const hashBuffer: Buffer = crypto.sha.sha256('data', { outputFormat: 'buffer' });

// Type-safe options
const options: HashOptions = {
  outputFormat: 'hex' as HashOutput
};

// Type-safe input
const input: CryptoInput = 'data' || Buffer.from('data') || new Uint8Array([1, 2, 3]);
```

## API Reference

### Function Signature

```typescript
function sha256(input: CryptoInput, options?: HashOptions): string | Buffer
function blake3(input: CryptoInput, options?: Blake3Options): string | Buffer
```

### Types

```typescript
type CryptoInput = string | Buffer | Uint8Array;

type HashOutput = 'hex' | 'base64' | 'binary' | 'buffer';

interface HashOptions {
  outputFormat?: HashOutput;
}

// BLAKE3 options (subset) for reference
interface Blake3Options extends HashOptions {
  keyed?: CryptoInput;         // 32-byte key
  deriveKey?: string;          // aka derive_key
  hashLength?: number;         // aka hash_length
}
```

### Available Functions

- `crypto.sha.sha1(input, options?)`
- `crypto.sha.sha256(input, options?)`
- `crypto.sha.sha512(input, options?)`
- `crypto.sha.sha3_256(input, options?)`
- `crypto.sha.sha3_512(input, options?)`
- `crypto.sha.md4(input, options?)`
- `crypto.sha.md5(input, options?)`
- `crypto.sha.blake2b(input, options?)`
- `crypto.sha.blake2s(input, options?)`
- `crypto.sha.blake3(input, options?)`
- `crypto.sha.whirlpool(input, options?)`
- `crypto.sha.ripemd160(input, options?)`

### Streaming API

```typescript
interface HashInstance {
  update(data: CryptoInput): this;
  digest(format?: HashOutput): string | Buffer;
  reset(): this;
}

// Create streaming instance
const hash: HashInstance = crypto.sha.sha256.create();
// Some algorithms accept options in create(), e.g. BLAKE3:
const blake3Hasher = crypto.sha.blake3.create({ keyed: Buffer.alloc(32, 0x11) });
```