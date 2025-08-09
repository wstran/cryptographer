<div align="center">

<h1>cryptographer.js</h1>

<p>High‑performance cryptography for Node.js (Rust + WebAssembly)</p>

<p>
  <a href="https://www.npmjs.com/package/cryptographer.js"><img alt="npm" src="https://img.shields.io/npm/v/cryptographer.js.svg?label=npm&color=cb3837"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
  <a href="https://cryptographer.gitbook.io"><img alt="docs" src="https://img.shields.io/badge/docs-gitbook-4c51bf"></a>
  <a href="#-tests"><img alt="tests" src="https://img.shields.io/badge/tests-passing-00c853"></a>
</p>

</div>

---

> 📖 Documentation: https://cryptographer.gitbook.io

## ✨ Highlights

- **Fast**: Rust + WASM, often 8–10× faster than JS libs
- **Complete**: Hash, HMAC, AES, ChaCha20, DES/3DES, KDF, DSA, RSA‑OAEP
- **Safe defaults**: AES‑GCM, Ed25519, Argon2id
- **TypeScript‑first**: Fully typed API

## 🚀 Install
```bash
npm install cryptographer.js
```

## 🧭 Quickstart
```javascript
import crypto from 'cryptographer.js';

// Hash (hex by default)
const h = crypto.hash.sha256('Hello World');

// HMAC
const mac = crypto.hmac.sha256('data', { key: 'secret' });

// AES-GCM (recommended)
// key: 16|24|32 bytes; nonce: 12 bytes
const key = crypto.randomBytes(32);
const nonce = crypto.randomBytes(12);
const ct = crypto.cipher.aes.encrypt('Hello', { key, iv: nonce, mode: 'gcm' });
const pt = crypto.cipher.aes.decrypt(ct, { key, iv: nonce, mode: 'gcm' });

// X25519 key exchange → derive shared secret
const a = crypto.x25519.generateKeypair();
const b = crypto.x25519.generateKeypair();
const ssA = crypto.x25519.deriveSharedSecret(a.privateKey, b.publicKey);
const ssB = crypto.x25519.deriveSharedSecret(b.privateKey, a.publicKey);

// Ed25519 signature
const ed = crypto.ed25519.generateKeypair();
const sig = crypto.ed25519.sign(ed.privateKey, 'hello');
const ok = crypto.ed25519.verify(ed.publicKey, 'hello', sig);
```

## 📋 Algorithms

### Hash
- sha1, sha256, sha512, sha3_256, sha3_512
- md4, md5 (legacy), ripemd160, whirlpool
- blake2b, blake2s, blake3 (keyed/deriveKey/xof)

### HMAC
- HMAC over: sha1, sha256, sha512, md5
- Streaming HMAC: `crypto.hmac.sha256.create({ key })`

### Ciphers (at a glance)

| Cipher | Modes | Key/Nonce | Notes |
|---|---|---|---|
| AES | gcm, ccm, ctr, siv | 16/24/32B; GCM=12B, CCM=13B, CTR=16B, SIV=16B (key 32/64B) | CBC/ECB accepted as aliases → map to GCM/CTR |
| ChaCha20 | ctr, poly1305 (AEAD) | 32B; nonce=12B | selector: 'ctr' or 'cbc'→AEAD |
| DES/3DES | cbc, ctr | 8B/24B; IV=8B | legacy/interop only |

> Note
> - AES‑GCM nonce=12B; AES‑CCM nonce=13B; AES‑SIV nonce=16B (key 32B/64B)
> - CBC/ECB kept for compatibility; mapped internally to GCM/CTR

### Key Exchange & Asymmetric
- X25519
- ECDH: p256, p384
- RSA-OAEP (SHA-1/256/384/512)

### DSA
- Ed25519
- ECDSA: secp256r1 (aka p256), secp256k1
- RSA Sign: PSS, PKCS#1 v1.5 (SHA-256/384/512)

## 🔎 Usage Examples

### Hash & Streaming
```javascript
// one-shot
crypto.hash.sha256('Hello World');

// streaming
const hs = crypto.hash.sha256.create();
hs.update('Hello').update(' ').update('World');
const out = hs.digest('hex');
```

### HMAC & Streaming
```javascript
// one-shot
crypto.hmac.sha256('data', { key: 'secret', outputFormat: 'hex' });

// streaming
const h = crypto.hmac.sha256.create({ key: 'secret' });
h.update('Hello').update(' ').update('World');
const tag = h.digest('hex');
```

### AES modes
```javascript
const key = crypto.randomBytes(32);

// GCM (recommended): nonce 12B
const n12 = crypto.randomBytes(12);
const g = crypto.cipher.aes.encrypt('data', { key, iv: n12, mode: 'gcm' });
const g0 = crypto.cipher.aes.decrypt(g, { key, iv: n12, mode: 'gcm' });

// CTR: iv 16B
const n16 = crypto.randomBytes(16);
const c = crypto.cipher.aes.encrypt('data', { key, iv: n16, mode: 'ctr' });
const c0 = crypto.cipher.aes.decrypt(c, { key, iv: n16, mode: 'ctr' });

// CCM: nonce 13B
const n13 = crypto.randomBytes(13);
const cc = crypto.cipher.aes.encrypt('data', { key, iv: n13, mode: 'ccm' });
const cc0 = crypto.cipher.aes.decrypt(cc, { key, iv: n13, mode: 'ccm' });

// SIV: nonce 16B, key 32B/64B
const kSiv = crypto.randomBytes(32);
const s = crypto.cipher.aes.encrypt('data', { key: kSiv, iv: n16, mode: 'siv' });
const s0 = crypto.cipher.aes.decrypt(s, { key: kSiv, iv: n16, mode: 'siv' });

// CBC alias (mapped to GCM internally)
const iv16 = crypto.randomBytes(16);
const cb = crypto.cipher.aes.encrypt('data', { key, iv: iv16, mode: 'cbc' });
```

### Key Exchange
```javascript
// X25519 → HKDF to symmetric key (example-only)
const a = crypto.x25519.generateKeypair();
const b = crypto.x25519.generateKeypair();
const ss = crypto.x25519.deriveSharedSecret(a.privateKey, b.publicKey);
```

### DSA
```javascript
// Ed25519
const ed = crypto.ed25519.generateKeypair();
const sig = crypto.ed25519.sign(ed.privateKey, 'hello');
crypto.ed25519.verify(ed.publicKey, 'hello', sig);

// ECDSA P-256
const kp = crypto.ecdsa.generateKeypair('secp256r1');
const s1 = crypto.ecdsa.sign('data', { curve: 'secp256r1', privateKey: kp.privateKey });
crypto.ecdsa.verify('data', { curve: 'secp256r1', publicKey: kp.publicKey, signature: s1 });
```

### KDF
```javascript
// PBKDF2
crypto.kdf.pbkdf2('password', { salt: crypto.randomBytes(16), iterations: 100000, keyLength: 32 });

// bcrypt
const b = crypto.kdf.bcrypt.hash('secret', { rounds: 12 });
crypto.kdf.bcrypt.verify('secret', b);

// Argon2 (PHC string)
await crypto.kdf.argon2('secret', { salt: crypto.randomBytes(16), timeCost: 3, memoryCost: 65536, parallelism: 4, variant: 'id' });
```

## 🧪 Tests
```bash
# Pretty, end‑to‑end test log
node tests/run-all.js
```

## 📦 TypeScript
```typescript
import type { CryptoInput, CipherMode, CipherOptions } from 'cryptographer.js';
const opts: CipherOptions = { key: Buffer.alloc(32), iv: Buffer.alloc(12), mode: 'gcm' };
```

## 🛠 Requirements
- Node.js >= 14, Linux/macOS/Windows, x64/arm64
- Node 18/20 recommended

## 🔐 Security
- Prefer AES‑GCM, Ed25519, Argon2id
- Avoid ECB; use CBC only for interop (mapped to AEAD internally)

## 📚 More
- Docs: https://cryptographer.gitbook.io
- Security Policy: SECURITY.md
- License: MIT
