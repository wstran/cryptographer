# Cryptographer.js Documentation

Welcome to the **cryptographer.js** documentation. This guide covers everything you need to know to install, use, and contribute to the project. If you are viewing this from GitBook, use the sidebar to jump between sections.

---

## 1. Introduction

**cryptographer.js** is a high-performance, server-side cryptography toolkit for Node.js. It leverages Rust dWebAssembly (WASM) to deliver best-in-class speed while exposing a developer-friendly TypeScript API.

Key design goals:

- **Performance first** – Every algorithm is implemented in Rust and compiled to WASM.
- **Security focused** – We forward-port upstream patches immediately and default to safe parameters.
- **Batteries included** – Hashes, HMAC, block ciphers, and modern password-hashing algorithms in one place.
- **Type-safe** – 100 % TypeScript definitions out-of-the-box.

>  cryptographer.js targets **Node 14 LTS or newer**. Browser support is **not** a goal (WASM threads + Node crypto bindings).

---

## 2. Installation

```bash
npm install cryptographer.js
```

If you clone the repo and wish to build from source:

```bash
# Prerequisites: Rust toolchain + wasm-pack + Node >=14
npm run build             # Builds WASM + TS
npm test                  # Runs integration tests (coming soon)
```

---

## 3. Supported Algorithms

| Category | Algorithms & Variants |
|----------|-----------------------------------------------------------|
| Hashes   | MD4 · MD5 · SHA-1 · SHA-2 (224/256/384/512) · SHA-3 (256/512) · BLAKE2b · BLAKE2s · BLAKE3 · RIPEMD-160 · Whirlpool |
| HMAC     | HMAC-MD5 · HMAC-SHA-1 · HMAC-SHA-2 · HMAC-SHA-3 |
| Ciphers  | AES-128/192/256 (CBC · ECB · CTR) · 3DES |
| KDF / PHA | PBKDF2 · Argon2i/d/id · bcrypt |

We are actively tracking additional algorithms such as Camellia, ChaCha20-Poly1305, and EdDSA.

---

## 4. Usage

### 4.1 Quick Example

```javascript
import crypto from 'cryptographer.js';

// SHA-256 in hex
const digest = crypto.hash.sha256('hello world');

// AES-256-CBC encryption
const encrypted = crypto.cipher.aes.encrypt('secret', {
  key: Buffer.from('0123456789abcdef0123456789abcdef'),
  iv: Buffer.from('0123456789abcdef')
});

// Argon2id password hash
const passwordHash = crypto.kdf.argon2('p@ssw0rd');
```

### 4.2 API Surface

All APIs accept **string | Buffer | Uint8Array** as data unless noted.

1. **Hashes**: `crypto.hash.<alg>(data, options?)`  
   – Options: `{ outputFormat?: 'hex' | 'base64' | 'binary' | 'buffer' }`
2. **HMAC**: `crypto.hmac.<alg>(data, { key, outputFormat? })`
3. **Ciphers**
   - Encrypt: `crypto.cipher.aes.encrypt(plain, { key, iv?, mode?, padding? })`
   - Decrypt: `crypto.cipher.aes.decrypt(cipher, { key, iv?, mode? })`
4. **KDF/PHA**
   - PBKDF2: `crypto.kdf.pbkdf2(password, { salt, iterations?, keyLength?, outputFormat? })`
   - Argon2: `crypto.kdf.argon2(password, { salt?, timeCost?, memoryCost?, parallelism?, keyLength?, variant?, outputFormat? })`
   - bcrypt: `crypto.kdf.bcrypt.hash(password, { rounds? }) / verify(password, hash)`

Refer to inline TypeScript definitions for full typing information.

---

## 5. Performance Benchmarks

Benchmarks live under `benchmark/`. Run them with:

```bash
npm run benchmark
```

Sample results on an M2 Max / Node 18 (higher = better):

| Algorithm | ops/s | vs crypto-js |
|-----------|-------|--------------|
| SHA-256   | 1.3 M | 8× faster |
| AES-256   | 0.9 M | 9× faster |
| PBKDF2    | 52 K  | 10× faster |

---

## 6. Security Notes

1. **No algorithm is a silver bullet** – Choose primitives appropriate to your threat model.
2. **Constant-time implementations** – Our Rust crates avoid branches on secret-dependent data whenever feasible.
3. **Side-Channel Disclosure** – Report any potential vulnerability privately at <wilsontran@ronus.io>.
4. **Regulatory Compliance** – You are responsible for ensuring that exporting crypto complies with your local laws.

---

## 7. Contributing

We welcome PRs! Please adhere to the following:

- Format code with `prettier` (configuration forthcoming).
- Run `npm run build && npm test` before committing.
- Discuss large changes in an issue first.

---

## 8. License

MIT © 2024 Wilson Tran – See `LICENSE` for full text.

---

## 9. About the Author

[Wilson Tran](https://github.com/wstran) is a software engineer at Ronus.io who enjoys building high-performance systems and developer tools.