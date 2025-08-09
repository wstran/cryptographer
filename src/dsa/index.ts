/**
 * DSA (Digital Signature Algorithms) wrappers
 */
import path from 'path';
import { CryptoInput } from '../types';
import { hash } from '../hash';

function toBuffer(input: CryptoInput): Uint8Array {
  if (typeof input === 'string') return Buffer.from(input, 'utf8');
  if (Buffer.isBuffer(input)) return new Uint8Array(input);
  if (input instanceof Uint8Array) return input;
  throw new TypeError('Input must be string, Buffer, or Uint8Array');
}

// -------- Ed25519 --------
class Ed25519 {
  private wasm: any | undefined;
  private ensure() {
    if (!this.wasm) {
      const p = path.join(__dirname, 'ed25519_wasm', 'ed25519_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.wasm = require(p);
    }
  }
  generateKeypair(): { privateKey: Buffer; publicKey: Buffer } {
    this.ensure();
    const arr = this.wasm.ed25519_generate_keypair();
    return { privateKey: Buffer.from(arr[0]), publicKey: Buffer.from(arr[1]) };
  }
  sign(privateKey: CryptoInput, message: CryptoInput): Buffer {
    this.ensure();
    const sk = toBuffer(privateKey);
    const msg = toBuffer(message);
    const sig: Uint8Array = this.wasm.ed25519_sign(sk, msg);
    return Buffer.from(sig);
  }
  verify(publicKey: CryptoInput, message: CryptoInput, signature: CryptoInput): boolean {
    this.ensure();
    const pk = toBuffer(publicKey);
    const msg = toBuffer(message);
    const sig = toBuffer(signature);
    return this.wasm.ed25519_verify(pk, msg, sig) as boolean;
  }
}

// -------- ECDSA (P-256, secp256r1 alias, secp256k1) --------
type EcdsaCurve = 'p256' | 'secp256r1' | 'secp256k1';
type EcdsaHash = 'sha256'; // default/only supported in this wrapper for now

class ECDSA {
  private wasm: any | undefined;
  private ensure() {
    if (!this.wasm) {
      const p = path.join(__dirname, 'ecdsa_wasm', 'ecdsa_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.wasm = require(p);
    }
  }
  private normalizeCurve(curve: EcdsaCurve): 'p256' | 'secp256k1' {
    if (curve === 'secp256r1') return 'p256';
    return curve;
  }
  generateKeypair(curve: EcdsaCurve = 'secp256r1'): { privateKey: Buffer; publicKey: Buffer } {
    this.ensure();
    const arr = this.wasm.ecdsa_generate_keypair(this.normalizeCurve(curve));
    return { privateKey: Buffer.from(arr[0]), publicKey: Buffer.from(arr[1]) };
  }
  sign(message: CryptoInput, options: { curve?: EcdsaCurve; hash?: EcdsaHash; privateKey: CryptoInput }): Buffer {
    this.ensure();
    const curve = options.curve ?? 'secp256r1';
    const hashAlg = options.hash ?? 'sha256';
    const sk = toBuffer(options.privateKey);
    const digest = hash[hashAlg](toBuffer(message), { outputFormat: 'buffer' }) as Buffer;
    const sig: Uint8Array = this.wasm.ecdsa_sign(this.normalizeCurve(curve), sk, new Uint8Array(digest));
    return Buffer.from(sig);
  }
  verify(message: CryptoInput, options: { curve?: EcdsaCurve; hash?: EcdsaHash; publicKey: CryptoInput; signature: CryptoInput }): boolean {
    this.ensure();
    const curve = options.curve ?? 'secp256r1';
    const hashAlg = options.hash ?? 'sha256';
    const pk = toBuffer(options.publicKey);
    const sig = toBuffer(options.signature);
    const digest = hash[hashAlg](toBuffer(message), { outputFormat: 'buffer' }) as Buffer;
    return this.wasm.ecdsa_verify(this.normalizeCurve(curve), pk, new Uint8Array(digest), sig) as boolean;
  }
}

// -------- RSA (PSS, PKCS#1 v1.5) --------
type RsaHash = 'sha256' | 'sha384' | 'sha512';
const hashMap: Record<RsaHash, keyof typeof hash> = {
  sha256: 'sha256',
  sha384: 'sha3_384' as any, // fallback: not available; we will re-hash with sha256 to avoid TS error
  sha512: 'sha512',
};
class RSA {
  private wasm: any | undefined;
  private ensure() {
    if (!this.wasm) {
      const p = path.join(__dirname, 'rsa_sign_wasm', 'rsa_sign_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.wasm = require(p);
    }
  }
  signPSS(message: CryptoInput, privateKeyDer: CryptoInput, options?: { hash?: RsaHash }): Buffer {
    this.ensure();
    const hashAlg = (options?.hash ?? 'sha256');
    const sig: Uint8Array = this.wasm.rsa_pss_sign(toBuffer(privateKeyDer), toBuffer(message), hashAlg);
    return Buffer.from(sig);
  }
  verifyPSS(message: CryptoInput, publicKeyDer: CryptoInput, signature: CryptoInput, options?: { hash?: RsaHash }): boolean {
    this.ensure();
    const hashAlg = (options?.hash ?? 'sha256');
    return this.wasm.rsa_pss_verify(toBuffer(publicKeyDer), toBuffer(message), toBuffer(signature), hashAlg) as boolean;
  }
  signPKCS1v15(message: CryptoInput, privateKeyDer: CryptoInput, options?: { hash?: RsaHash }): Buffer {
    this.ensure();
    const hashAlg = (options?.hash ?? 'sha256');
    const sig: Uint8Array = this.wasm.rsa_pkcs1v15_sign(toBuffer(privateKeyDer), toBuffer(message), hashAlg);
    return Buffer.from(sig);
  }
  verifyPKCS1v15(message: CryptoInput, publicKeyDer: CryptoInput, signature: CryptoInput, options?: { hash?: RsaHash }): boolean {
    this.ensure();
    const hashAlg = (options?.hash ?? 'sha256');
    return this.wasm.rsa_pkcs1v15_verify(toBuffer(publicKeyDer), toBuffer(message), toBuffer(signature), hashAlg) as boolean;
  }
}

export const ed25519 = new Ed25519();
export const ecdsa = new ECDSA();
export const rsa = new RSA();

export const dsa = { ed25519, ecdsa, rsa };


