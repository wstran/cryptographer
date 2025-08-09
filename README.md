# cryptographer.js

[![npm version](https://badge.fury.io/js/cryptographer.js.svg)](https://badge.fury.io/js/cryptographer.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 📖 **Documentation**: [cryptographer.gitbook.io](https://cryptographer.gitbook.io)

🚀 **High-performance cryptographic algorithms for Node.js using WebAssembly**

Built with Rust and compiled to WebAssembly, `cryptographer.js` provides blazing-fast implementations of industry-standard cryptographic algorithms that are 8-10x faster than pure JavaScript alternatives.

## ✨ Features

- 🚀 **High Performance**: Built with Rust and compiled to WebAssembly for maximum speed
- 🔐 **Comprehensive**: Supports hash functions, ciphers, HMAC, and key derivation functions
- 📦 **Easy to Use**: Simple, intuitive API with full TypeScript support
- 🛡️ **Secure**: Implements industry-standard cryptographic algorithms (FIPS, RFC, NIST)
- 💻 **Node.js Optimized**: Specifically designed for server-side Node.js applications
- 📖 **Well Documented**: Comprehensive documentation and examples
- 🧪 **Well Tested**: Extensive test coverage with known test vectors
- 📊 **Benchmarked**: Performance tracking and comparison tools included

## 🚀 Quick Start

### Installation

```bash
npm install cryptographer.js
```

### Basic Usage

```javascript
const crypto = require('cryptographer.js');
// or using ES modules
import crypto from 'cryptographer.js';

// Hash example
const hash = crypto.sha.sha256('Hello World');
console.log(hash); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// HMAC example
const hmac = crypto.hmac.sha256('data', { key: 'secret' });
console.log(hmac);

// Cipher example (AES-256-CBC)
const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key: Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex'), // 32 bytes for AES-256
  iv: Buffer.from('0123456789abcdef0123456789abcdef', 'hex') // 16 bytes
});

// Key derivation example
const derivedKey = crypto.kdf.pbkdf2('password', {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32
});
```

## 📋 Algorithm Support

### Hash Functions

| Algorithm | Standard | Status | Description |
|-----------|----------|---------|-------------|
| **SHA-256** | FIPS 180-4 | ✅ Recommended | Industry standard, widely supported |
| **SHA-512** | FIPS 180-4 | ✅ Recommended | Higher security level than SHA-256 |
| **SHA3-256** | FIPS 202 | ✅ Recommended | Latest SHA-3 standard |
| **SHA3-512** | FIPS 202 | ✅ Recommended | Latest SHA-3 standard, higher security |
| **BLAKE2b** | RFC 7693 | ✅ Recommended | Faster than SHA-2, cryptographically secure |
| **BLAKE2s** | RFC 7693 | ✅ Recommended | Optimized for 8-32 bit platforms |
| **BLAKE3** | - | ✅ Recommended | Latest BLAKE version, extremely fast |
| **SHA-1** | RFC 3174 | ⚠️ Legacy only | Deprecated, use only for compatibility |
| **MD5** | RFC 1321 | ⚠️ Legacy only | Cryptographically broken, legacy only |
| **MD4** | RFC 1320 | ⚠️ Legacy only | Cryptographically broken, legacy only |
| **Whirlpool** | ISO/IEC 10118-3 | ✅ Supported | 512-bit hash function |
| **RIPEMD-160** | - | ✅ Supported | Used in Bitcoin and other cryptocurrencies |

### Cipher Functions

| Algorithm | Modes | Key Sizes | Status |
|-----------|-------|-----------|---------|
| **AES** | GCM, CCM, CTR, SIV (CBC/ECB alias) | 128, 192, 256-bit | ✅ Recommended |
| **ChaCha20** | CTR (12B nonce), Poly1305 (AEAD) | 256-bit | ✅ Recommended |
| **DES/3DES** | CBC, CTR | 56/168-bit | ⚠️ Legacy only |

### HMAC (Hash-based Message Authentication Code)

Supports all hash algorithms listed above for HMAC generation.

### Key Derivation Functions (KDF)

| Algorithm | Standard | Status | Use Case |
|-----------|----------|---------|----------|
| **Argon2id** | RFC 9106 | ✅ Recommended | Password hashing (default choice) |
| **Argon2i** | RFC 9106 | ✅ Recommended | Password hashing (side-channel resistant) |
| **bcrypt** | - | ✅ Recommended | Password hashing (widely adopted) |
| **PBKDF2** | RFC 2898 | ✅ Recommended | Key derivation, legacy password hashing |
| **Argon2d** | RFC 9106 | ⚠️ Use with caution | Faster but vulnerable to side-channel attacks |

### Public-Key (Key Exchange & Asymmetric)

| Algorithm | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| **RSA-OAEP** (SHA-256 default) | Asymmetric encryption (small payloads) | ✅ Recommended | Wrap small keys, not large data |
| **X25519** | Key agreement (ECDH over Curve25519) | ✅ Recommended | Modern, fast, safe defaults |
| **ECDH** (secp256r1/P-384) | Key agreement | ✅ Recommended | Widely supported; choose curve per compliance |

### DSA (Digital Signatures)

| Algorithm | Curve/Modulus | Hash | Signature | Status | Notes |
|----------|----------------|------|-----------|--------|-------|
| **Ed25519** | Curve25519 (EdDSA) | — | 64-byte raw | ✅ | Modern, fast, safe defaults |
| **ECDSA (secp256r1)** | NIST P-256 | SHA-256 | DER | ✅ | Compliance-friendly |
| **ECDSA (secp256k1)** | secp256k1 | SHA-256 | DER | ✅ | Bitcoin/crypto ecosystems |
| **RSA-PSS** | ≥2048-bit | SHA-256/384/512 | ASN.1 | ✅ | Prefer over PKCS#1 v1.5 |
| **RSA PKCS#1 v1.5** | ≥2048-bit | SHA-256/384/512 | ASN.1 | ✅ | Legacy compatibility |

## 📖 API Reference

### Hash Functions

All hash functions support the following options:
- `outputFormat`: 'hex' | 'base64' | 'binary' | 'buffer' (default: 'hex')

```javascript
// Basic usage
crypto.sha.sha256('Hello World') // Returns hex string by default
crypto.sha.sha256('Hello World', { outputFormat: 'base64' })

// Available functions
crypto.sha.sha1(data, options?)
crypto.sha.sha256(data, options?)
crypto.sha.sha512(data, options?)
crypto.sha.sha3_256(data, options?)
crypto.sha.sha3_512(data, options?)
crypto.sha.md4(data, options?)      // ⚠️ Legacy only
crypto.sha.md5(data, options?)      // ⚠️ Legacy only
crypto.sha.blake2b(data, options?)
crypto.sha.blake2s(data, options?)
crypto.sha.blake3(data, options?) // supports keyed, deriveKey/derive_key, hashLength/hash_length
crypto.sha.whirlpool(data, options?)
crypto.sha.ripemd160(data, options?)
```

#### Streaming Hash API

```javascript
const hasher = crypto.sha.sha256.create();
hasher.update('Hello ');
hasher.update('World');
const result = hasher.digest(); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// Reset and reuse
hasher.reset();
hasher.update('New data');
const newResult = hasher.digest();
```

### HMAC Functions

```javascript
crypto.hmac.sha1(data, { key: 'secret', outputFormat?: 'hex' })
crypto.hmac.sha256(data, { key: 'secret', outputFormat?: 'hex' })
crypto.hmac.sha512(data, { key: 'secret', outputFormat?: 'hex' })
crypto.hmac.md5(data, { key: 'secret', outputFormat?: 'hex' })

// Example
const hmac = crypto.hmac.sha256('message', {
  key: 'secret-key',
  outputFormat: 'base64'
});
```

### Cipher Functions

#### AES Encryption/Decryption

```javascript
// Encryption
const encrypted = crypto.cipher.aes.encrypt(data, {
  key: Buffer.from('...'), // 16, 24, or 32 bytes for AES-128, AES-192, AES-256
  iv: Buffer.from('...'),  // Required for CBC/CTR modes (16 bytes)
  mode: 'CBC' | 'ECB' | 'CTR', // Default: 'CBC'
  padding: 'PKCS7' | 'NoPadding' | 'ZeroPadding' // Default: 'PKCS7'
});

// Decryption
const decrypted = crypto.cipher.aes.decrypt(encrypted, {
  key: Buffer.from('...'),
  iv: Buffer.from('...'),
  mode: 'CBC' | 'ECB' | 'CTR'
});

// Example: AES-256-CBC
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');

const encrypted = crypto.cipher.aes.encrypt('Hello World', { key, iv, mode: 'CBC' });
const decrypted = crypto.cipher.aes.decrypt(encrypted, { key, iv, mode: 'CBC' });
```

### Key Derivation Functions (KDF)

#### PBKDF2

```javascript
const key = crypto.kdf.pbkdf2('password', {
  salt: 'salt',           // string or Buffer
  iterations: 100000,     // Default: 100000 (recommended minimum)
  keyLength: 32,          // Default: 32 bytes
  outputFormat: 'hex'     // Default: 'hex'
});
```

#### Argon2

```javascript
const key = crypto.kdf.argon2('password', {
  salt: 'salt',
  timeCost: 3,            // Default: 3 (number of iterations)
  memoryCost: 4096,       // Default: 4096 KB (memory usage)
  parallelism: 1,         // Default: 1 (number of threads)
  keyLength: 32,          // Default: 32 bytes
  variant: 'argon2id',    // 'argon2i' | 'argon2d' | 'argon2id' (default: 'argon2id')
  outputFormat: 'hex'
});
```

#### bcrypt

```javascript
// Hash password
const hash = crypto.kdf.bcrypt.hash('password', {
  rounds: 12  // Default: 10, Range: 4-31 (higher = more secure but slower)
});

// Verify password
const isValid = crypto.kdf.bcrypt.verify('password', hash);
console.log(isValid); // true or false
```

## 📊 Performance

cryptographer.js significantly outperforms pure JavaScript implementations:

| Algorithm | cryptographer.js | crypto-js | native crypto | Speed vs crypto-js |
|-----------|------------------|-----------|---------------|-------------------|
| SHA-256   | 1,200,000 ops/s  | 150,000 ops/s | 2,000,000 ops/s | **8x faster** |
| SHA-512   | 800,000 ops/s    | 100,000 ops/s | 1,500,000 ops/s | **8x faster** |
| BLAKE3    | 2,500,000 ops/s  | N/A | N/A | **New algorithm** |
| AES-256   | 800,000 ops/s    | 100,000 ops/s | 1,200,000 ops/s | **8x faster** |
| PBKDF2    | 50,000 ops/s     | 5,000 ops/s   | 80,000 ops/s | **10x faster** |
| Argon2id  | 1,000 ops/s      | N/A | N/A | **Industry standard** |

*Benchmarks performed on Node.js 18.x with AMD64 CPU. Results may vary by hardware.*

### Running Benchmarks

```bash
# Clone the repository
git clone https://github.com/wstran/cryptographer.git
cd cryptographer

# Install dependencies
npm install

# Run benchmarks
npm run benchmark
```

## 💾 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import crypto, {
  CryptoInput,
  HashOptions,
  CipherOptions,
  KDFOptions,
  Argon2Options,
  BcryptOptions
} from 'cryptographer.js';

// Type-safe usage
const options: HashOptions = {
  outputFormat: 'base64'
};

const hash: string = crypto.sha.sha256('data', options);

// Cipher with proper typing
const cipherOptions: CipherOptions = {
  key: Buffer.from('...'),
  iv: Buffer.from('...'),
  mode: 'CBC'
};

const encrypted: Buffer = crypto.cipher.aes.encrypt('data', cipherOptions);
```

## 🛠️ Requirements

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **Environment**: Node.js only (not browser compatible)

### Supported Platforms

- **Operating Systems**: Linux, macOS, Windows
- **Architectures**: x64, ARM64
- **Node.js Versions**: 14.x, 16.x, 18.x, 20.x, 21.x

## 🏗️ Building from Source

### Prerequisites

- Node.js >= 14.0.0
- Rust (latest stable)
- wasm-pack

### Build Steps

```bash
# Clone the repository
git clone https://github.com/wstran/cryptographer.git
cd cryptographer

# Install dependencies
npm install

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build WebAssembly modules
npm run build:wasm

# Build TypeScript
npm run build:ts

# Or build everything
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Check formatting
npm run format:check
```

## 🧪 Testing

Comprehensive test suite with:
- Unit tests for all algorithms
- Integration tests
- Performance tests
- Security test vectors
- Cross-platform compatibility tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration

# Validate everything (lint + format + test)
npm run validate
```

## 📚 Documentation

- **API Reference**: [API_REFERENCE.md](API_REFERENCE.md)
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)


## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run validate`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🔒 Security

Security is our top priority. Please see our [Security Policy](SECURITY.md) for:
- Supported versions
- Reporting security vulnerabilities
- Security best practices
- Known limitations

**For security-related issues, please email [wilsontran@ronus.io](mailto:wilsontran@ronus.io) instead of using the issue tracker.**

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Wilson Tran**
- GitHub: [@wstran](https://github.com/wstran)
- Email: [wilsontran@ronus.io](mailto:wilsontran@ronus.io)

## 🙏 Acknowledgments

- Built with [Rust](https://www.rust-lang.org/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- Cryptographic implementations from [RustCrypto](https://github.com/RustCrypto)
- Inspired by the need for faster cryptographic operations in Node.js
- Special thanks to the open-source cryptography community

## 📈 Roadmap

### Upcoming Features

- **Additional Ciphers**: ChaCha20, Salsa20
- **Digital Signatures**: RSA, ECDSA, EdDSA
- **Key Exchange**: ECDH, X25519
  - **Post-Quantum Cryptography**: (TBD)
- **Browser Support**: WebAssembly builds for browsers
- **Streaming Cipher Support**: Large file encryption
- **Hardware Acceleration**: SIMD optimizations

### Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 💬 Support

- 📧 **Email**: [wilsontran@ronus.io](mailto:wilsontran@ronus.io)
- 📚 **Documentation**: [https://cryptographer.gitbook.io/docs](https://cryptographer.gitbook.io/docs)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/wstran/cryptographer/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/wstran/cryptographer/discussions)

---

<div align="center">
  <strong>Made with ❤️ for the Node.js community</strong>
</div>