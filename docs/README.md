# 📚 Cryptographer.js Documentation

Welcome to the **cryptographer.js v1.0.7** documentation. This guide covers everything you need to know to install, use, and contribute to the project.

## 🚀 Quick Start

Get started with cryptographer.js in minutes:

```bash
npm install cryptographer.js
```

```javascript
import crypto from 'cryptographer.js';

// SHA-256 hash
const hash = crypto.hash.sha256('Hello World');
console.log(hash); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// AES-256-CBC encryption
const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key: Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex'),
  iv: Buffer.from('0123456789abcdef0123456789abcdef', 'hex')
});

// Argon2id password hash
const passwordHash = crypto.kdf.argon2('p@ssw0rd');
```

## 📚 What's Inside

- **Getting Started** - Installation and basic setup
- **API Reference** - Complete function documentation
- **Examples** - Real-world usage examples
- **Security Guide** - Best practices and security considerations
- **Performance** - Benchmarks and optimization tips
- **Contributing** - How to contribute to the project

## 🎯 Key Features

- **High Performance** - Built with Rust and WebAssembly
- **Comprehensive** - Hash functions, ciphers, HMAC, and KDF
- **Type Safe** - Full TypeScript support
- **Node.js Optimized** - Designed for server-side applications
- **Well Tested** - Extensive test coverage
- **Production Ready** - Industry-standard implementations

## 📖 Navigation

Use the sidebar to navigate between sections. Each section provides detailed information and examples.