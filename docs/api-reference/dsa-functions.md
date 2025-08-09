# DSA Functions

cryptographer.js provides digital signature algorithms with a consistent API and production-focused guidance.

## Supported Algorithms

| Algorithm | Curve/Modulus | Hash | Signature | Status | Notes |
|----------|----------------|------|-----------|--------|-------|
| Ed25519 | Curve25519 (EdDSA) | — | 64-byte raw | ✅ | Modern, fast, safe defaults |
| ECDSA (secp256r1) | NIST P-256 | SHA-256 | DER | ✅ | Compliance-friendly |
| ECDSA (secp256k1) | secp256k1 | SHA-256 | DER | ✅ | Bitcoin/crypto ecosystems |
| RSA-PSS | ≥2048-bit | SHA-256/384/512 | ASN.1 | ✅ | Prefer over PKCS#1 v1.5 |
| RSA PKCS#1 v1.5 | ≥2048-bit | SHA-256/384/512 | ASN.1 | ✅ | Legacy compatibility |

Omitted (not implemented): DSA (DSS), Dilithium, Falcon, SPHINCS+, MQDSS (PQC) due to WASM/toolchain stability and scope.

## Ed25519

- Keys: private 32 B, public 32 B; signature 64 B
- API
```ts
ed25519.generateKeypair(): { privateKey: Buffer; publicKey: Buffer }
ed25519.sign(privateKey: CryptoInput, message: CryptoInput): Buffer
ed25519.verify(publicKey: CryptoInput, message: CryptoInput, signature: CryptoInput): boolean
```
- Example
```ts
const ed = crypto.ed25519.generateKeypair();
const sig = crypto.ed25519.sign(ed.privateKey, 'hello');
const ok = crypto.ed25519.verify(ed.publicKey, 'hello', sig);
```

## ECDSA

- Curves: `secp256r1` (aka NIST P-256), `secp256k1`
- Public key: uncompressed SEC1 (65 bytes)
- Hashing: library computes SHA-256 digest internally before signing/verifying
- API
```ts
ecdsa.generateKeypair(curve?: 'secp256r1' | 'secp256k1')
  => { privateKey: Buffer; publicKey: Buffer }
ecdsa.sign(message: CryptoInput, { curve?: 'secp256r1'|'secp256k1', privateKey: CryptoInput, hash?: 'sha256' }): Buffer // DER
ecdsa.verify(message: CryptoInput, { curve?: 'secp256r1'|'secp256k1', publicKey: CryptoInput, signature: CryptoInput, hash?: 'sha256' }): boolean
```
- Example
```ts
const kp = crypto.ecdsa.generateKeypair('secp256r1');
const sig = crypto.ecdsa.sign('data', { curve: 'secp256r1', privateKey: kp.privateKey });
const ok = crypto.ecdsa.verify('data', { curve: 'secp256r1', publicKey: kp.publicKey, signature: sig });
```

## RSA Signatures

- Key formats: Public SPKI/PKCS#1 DER; Private PKCS#8/PKCS#1 DER
- Hash: 'sha256' | 'sha384' | 'sha512'
- API
```ts
rsa.signPSS(message: CryptoInput, privateKeyDer: CryptoInput, { hash }?): Buffer
rsa.verifyPSS(message: CryptoInput, publicKeyDer: CryptoInput, signature: CryptoInput, { hash }?): boolean
rsa.signPKCS1v15(message: CryptoInput, privateKeyDer: CryptoInput, { hash }?): Buffer
rsa.verifyPKCS1v15(message: CryptoInput, publicKeyDer: CryptoInput, signature: CryptoInput, { hash }?): boolean
```
- Example
```ts
import fs from 'fs';
const msg = Buffer.from('hello');
const prv = fs.readFileSync('private_key.der');
const pub = fs.readFileSync('public_key.der');
const s = crypto.rsa.signPSS(msg, prv, { hash: 'sha256' });
const ok = crypto.rsa.verifyPSS(msg, pub, s, { hash: 'sha256' });
```

## Security Guidance
- Prefer Ed25519 or ECDSA `secp256r1` for modern systems; choose `secp256k1` when ecosystem requires it.
- Prefer RSA-PSS over PKCS#1 v1.5; use ≥2048-bit modulus.
- Validate key encodings (DER for RSA, uncompressed SEC1 for ECDSA) and store private keys securely.
- Bind signatures to context (include purpose, timestamp, nonce in message format).

## Error Handling
```ts
try {
  const sig = crypto.ecdsa.sign('msg', { curve: 'secp256r1', privateKey });
} catch (e) {
  if (String(e).includes('Invalid')) {
    // invalid key/curve/encoding
  }
}
```

## TypeScript Types
```ts
type EcdsaCurve = 'secp256r1' | 'secp256k1';
```

## Interoperability Notes
- ECDSA public keys are uncompressed SEC1 (0x04 || X || Y). Convert from compressed form if needed.
- RSA keys must be DER; if you have PEM, decode base64 between -----BEGIN ...----- and convert to Buffer.
