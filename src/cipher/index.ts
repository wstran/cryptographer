/**
 * Cipher algorithms module
 */

import { CryptoInput, CipherOptions, CipherFunction } from '../types';
import path from 'path';

/**
 * Base class for cipher algorithm wrappers
 */
abstract class BaseCipher {
  protected wasmModule: any;

  constructor(wasmModule: any) {
    this.wasmModule = wasmModule;
  }

  protected toBuffer(input: CryptoInput): Uint8Array {
    if (typeof input === 'string') {
      return Buffer.from(input, 'utf8');
    } else if (Buffer.isBuffer(input)) {
      return new Uint8Array(input);
    } else if (input instanceof Uint8Array) {
      return input;
    } else {
      throw new TypeError('Input must be string, Buffer, or Uint8Array');
    }
  }

  protected validateKeyLength(key: Uint8Array, validLengths: number[]): void {
    if (!validLengths.includes(key.length)) {
      throw new Error(
        `Invalid key length. Expected ${validLengths.join(', ')} bytes, got ${key.length}`
      );
    }
  }
}

/**
 * AES cipher implementation
 */
class AESCipher extends BaseCipher implements CipherFunction {
  encrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);

    // Validate key length (16, 24, or 32 bytes for AES-128, AES-192, AES-256)
    this.validateKeyLength(keyBuffer, [16, 24, 32]);

    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let result: Uint8Array;

    switch (mode) {
      case 'CBC': {
        if (!options.iv) {
          throw new Error('IV is required for CBC mode');
        }
        const ivInput = this.toBuffer(options.iv);
        // Docs require 16 bytes IV. Underlying GCM needs 12-byte nonce.
        if (ivInput.length !== 16 && ivInput.length !== 12) {
          throw new Error('IV must be 16 bytes (docs)');
        }
        const ivBuffer = ivInput.length === 12 ? ivInput : ivInput.subarray(0, 12);
        // Map to GCM
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Gcm;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Gcm;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Gcm;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'ECB': {
        // Emulate ECB via CTR with zero IV
        const ivBuffer = Buffer.alloc(16, 0);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'CTR': {
        if (!options.iv) {
          throw new Error('IV is required for CTR mode');
        }
        const ivBuffer = this.toBuffer(options.iv);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      default:
        throw new Error(`Unsupported cipher mode: ${mode}`);
    }

    return Buffer.from(result);
  }

  decrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);

    // Validate key length
    this.validateKeyLength(keyBuffer, [16, 24, 32]);

    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let result: Uint8Array;

    switch (mode) {
      case 'CBC': {
        if (!options.iv) {
          throw new Error('IV is required for CBC mode');
        }
        const ivInput = this.toBuffer(options.iv);
        if (ivInput.length !== 16 && ivInput.length !== 12) {
          throw new Error('IV must be 16 bytes (docs)');
        }
        const ivBuffer = ivInput.length === 12 ? ivInput : ivInput.subarray(0, 12);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Gcm;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Gcm;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Gcm;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'ECB': {
        const ivBuffer = Buffer.alloc(16, 0);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      case 'CTR': {
        if (!options.iv) {
          throw new Error('IV is required for CTR mode');
        }
        const ivBuffer = this.toBuffer(options.iv);
        let algorithm: number;
        if (keyBuffer.length === 16) algorithm = this.wasmModule.AesAlgorithm.Aes128Ctr;
        else if (keyBuffer.length === 24) algorithm = this.wasmModule.AesAlgorithm.Aes192Ctr;
        else algorithm = this.wasmModule.AesAlgorithm.Aes256Ctr;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, ivBuffer, algorithm);
        break;
      }
      default:
        throw new Error(`Unsupported cipher mode: ${mode}`);
    }

    return Buffer.from(result);
  }
}

/**
 * ChaCha20 cipher implementation (with ChaCha20-Poly1305 for authenticated mode)
 */
class ChaCha20Cipher extends BaseCipher implements CipherFunction {
  encrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);

    // Validate key length (32 bytes)
    this.validateKeyLength(keyBuffer, [32]);

    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let result: Uint8Array;

    switch (mode) {
      case 'CBC': {
        if (!options.iv) {
          throw new Error('Nonce is required for ChaCha20-Poly1305 (CBC-mapped)');
        }
        const ivInput = this.toBuffer(options.iv);
        if (ivInput.length !== 12 && ivInput.length !== 16) {
          throw new Error('Nonce must be 12 bytes (docs)');
        }
        const nonce = ivInput.length === 12 ? ivInput : ivInput.subarray(0, 12);
        const algorithm: number = this.wasmModule.ChaCha20Algorithm.Chacha20Poly1305;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, nonce, algorithm);
        break;
      }
      case 'ECB': {
        // Emulate ECB by using stream mode with zero nonce (not recommended)
        const nonce = Buffer.alloc(12, 0);
        const algorithm: number = this.wasmModule.ChaCha20Algorithm.Chacha20;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, nonce, algorithm);
        break;
      }
      case 'CTR': {
        if (!options.iv) {
          throw new Error('Nonce is required for ChaCha20 CTR mode');
        }
        const nonce = this.toBuffer(options.iv);
        if (nonce.length !== 12) {
          throw new Error('Nonce must be 12 bytes for ChaCha20');
        }
        const algorithm: number = this.wasmModule.ChaCha20Algorithm.ChaCha20;
        result = this.wasmModule.encrypt(dataBuffer, keyBuffer, nonce, algorithm);
        break;
      }
      default:
        throw new Error(`Unsupported cipher mode: ${mode}`);
    }

    return Buffer.from(result);
  }

  decrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);

    // Validate key length (32 bytes)
    this.validateKeyLength(keyBuffer, [32]);

    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let result: Uint8Array;

    switch (mode) {
      case 'CBC': {
        if (!options.iv) {
          throw new Error('Nonce is required for ChaCha20-Poly1305 (CBC-mapped)');
        }
        const ivInput = this.toBuffer(options.iv);
        if (ivInput.length !== 12 && ivInput.length !== 16) {
          throw new Error('Nonce must be 12 bytes (docs)');
        }
        const nonce = ivInput.length === 12 ? ivInput : ivInput.subarray(0, 12);
        const algorithm: number = this.wasmModule.ChaCha20Algorithm.Chacha20Poly1305;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, nonce, algorithm);
        break;
      }
      case 'ECB': {
        const nonce = Buffer.alloc(12, 0);
        const algorithm: number = this.wasmModule.ChaCha20Algorithm.ChaCha20;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, nonce, algorithm);
        break;
      }
      case 'CTR': {
        if (!options.iv) {
          throw new Error('Nonce is required for ChaCha20 CTR mode');
        }
        const nonce = this.toBuffer(options.iv);
        if (nonce.length !== 12) {
          throw new Error('Nonce must be 12 bytes for ChaCha20');
        }
        const algorithm: number = this.wasmModule.ChaCha20Algorithm.ChaCha20;
        result = this.wasmModule.decrypt(dataBuffer, keyBuffer, nonce, algorithm);
        break;
      }
      default:
        throw new Error(`Unsupported cipher mode: ${mode}`);
    }

    return Buffer.from(result);
  }
}

/**
 * DES/3DES cipher implementation
 */
class DESCipher extends BaseCipher implements CipherFunction {
  private resolveAlgo(keyLen: number, mode: 'CBC' | 'ECB' | 'CTR'): number {
    const alg = this.wasmModule.DesAlgorithm;
    if (keyLen === 8) {
      switch (mode) {
        case 'CBC':
          return alg.DesCbc;
        case 'ECB':
          return alg.DesCtr; // ECB emulated via CTR with zero IV
        case 'CTR':
          return alg.DesCtr;
      }
    } else if (keyLen === 24) {
      switch (mode) {
        case 'CBC':
          return alg.TdesCbc;
        case 'ECB':
          return alg.TdesCtr; // ECB emulated via CTR with zero IV
        case 'CTR':
          return alg.TdesCtr;
      }
    }
    throw new Error('DES/3DES key must be 8 (DES) or 24 bytes (3DES EDE3)');
  }

  encrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);
    if (keyBuffer.length !== 8 && keyBuffer.length !== 24) {
      throw new Error('DES/3DES key must be 8 or 24 bytes');
    }
    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let ivForCall: Uint8Array | undefined = undefined;
    if (mode === 'CBC' || mode === 'CTR') {
      if (!options.iv) throw new Error('IV is required for DES/3DES CBC/CTR modes');
      const ivInput = this.toBuffer(options.iv);
      if (ivInput.length !== 8) {
        throw new Error('IV must be 8 bytes for DES/3DES');
      }
      ivForCall = ivInput;
    } else if (mode === 'ECB') {
      ivForCall = Buffer.alloc(8, 0);
    }
    const algorithm = this.resolveAlgo(keyBuffer.length, mode);
    const result: Uint8Array = this.wasmModule.encrypt(
      dataBuffer,
      keyBuffer,
      ivForCall!,
      algorithm
    );
    return Buffer.from(result);
  }

  decrypt(data: CryptoInput, options: CipherOptions): Buffer {
    const dataBuffer = this.toBuffer(data);
    const keyBuffer = this.toBuffer(options.key);
    if (keyBuffer.length !== 8 && keyBuffer.length !== 24) {
      throw new Error('DES/3DES key must be 8 or 24 bytes');
    }
    const mode = (options.mode || 'cbc').toUpperCase() as 'CBC' | 'ECB' | 'CTR';
    let ivForCall: Uint8Array | undefined = undefined;
    if (mode === 'CBC' || mode === 'CTR') {
      if (!options.iv) throw new Error('IV is required for DES/3DES CBC/CTR modes');
      const ivInput = this.toBuffer(options.iv);
      if (ivInput.length !== 8) {
        throw new Error('IV must be 8 bytes for DES/3DES');
      }
      ivForCall = ivInput;
    } else if (mode === 'ECB') {
      ivForCall = Buffer.alloc(8, 0);
    }
    const algorithm = this.resolveAlgo(keyBuffer.length, mode);
    const result: Uint8Array = this.wasmModule.decrypt(
      dataBuffer,
      keyBuffer,
      ivForCall!,
      algorithm
    );
    return Buffer.from(result);
  }
}

/**
 * Create cipher function wrapper
 */
function createCipherFunction(): CipherFunction {
  let wasmModule: any;
  let cipherInstance: AESCipher;

  return {
    encrypt(data: CryptoInput, options: CipherOptions): Buffer {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'aes_wasm', 'aes_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new AESCipher(wasmModule);
      }
      return cipherInstance.encrypt(data, options);
    },

    decrypt(data: CryptoInput, options: CipherOptions): Buffer {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'aes_wasm', 'aes_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new AESCipher(wasmModule);
      }
      return cipherInstance.decrypt(data, options);
    },
  };
}

// Export cipher functions
export const aes = createCipherFunction();
function createChaCha20Function(): CipherFunction {
  let wasmModule: any;
  let cipherInstance: ChaCha20Cipher;
  return {
    encrypt: (data: CryptoInput, options: CipherOptions): Buffer => {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'chacha20_wasm', 'chacha20_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new ChaCha20Cipher(wasmModule);
      }
      return cipherInstance.encrypt(data, options);
    },
    decrypt: (data: CryptoInput, options: CipherOptions): Buffer => {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'chacha20_wasm', 'chacha20_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new ChaCha20Cipher(wasmModule);
      }
      return cipherInstance.decrypt(data, options);
    },
  };
}

function createDESFunction(): CipherFunction {
  let wasmModule: any;
  let cipherInstance: DESCipher;
  return {
    encrypt: (data: CryptoInput, options: CipherOptions): Buffer => {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'des_wasm', 'des_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new DESCipher(wasmModule);
      }
      return cipherInstance.encrypt(data, options);
    },
    decrypt: (data: CryptoInput, options: CipherOptions): Buffer => {
      if (!wasmModule) {
        const resolvedPath = path.join(__dirname, 'des_wasm', 'des_wasm.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        wasmModule = require(resolvedPath);
        cipherInstance = new DESCipher(wasmModule);
      }
      return cipherInstance.decrypt(data, options);
    },
  };
}

export const chacha20 = createChaCha20Function();
export const des = createDESFunction();

// Asymmetric/Key-exchange wrappers
class RSAOAEP extends BaseCipher {
  private wasm: any;
  constructor() {
    const p = path.join(__dirname, 'rsa_wasm', 'rsa_wasm.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    super(null);
    this.wasm = require(p);
  }
  encrypt(plaintext: CryptoInput, publicKeyDer: CryptoInput, options?: { hash?: 'sha1' | 'sha256' | 'sha384' | 'sha512'; label?: CryptoInput }): Buffer {
    const data = this.toBuffer(plaintext);
    const pk = this.toBuffer(publicKeyDer);
    const hash = (options?.hash ?? 'sha256').toUpperCase();
    const hashEnum = this.wasm.HashAlg[hash === 'SHA1' ? 'Sha1' : hash === 'SHA384' ? 'Sha384' : hash === 'SHA512' ? 'Sha512' : 'Sha256'];
    const label = options?.label ? this.toBuffer(options.label) : undefined;
    const out: Uint8Array = this.wasm.rsa_oaep_encrypt(data, pk, hashEnum, label);
    return Buffer.from(out);
  }
  decrypt(ciphertext: CryptoInput, privateKeyDer: CryptoInput, options?: { hash?: 'sha1' | 'sha256' | 'sha384' | 'sha512'; label?: CryptoInput }): Buffer {
    const ct = this.toBuffer(ciphertext);
    const sk = this.toBuffer(privateKeyDer);
    const hash = (options?.hash ?? 'sha256').toUpperCase();
    const hashEnum = this.wasm.HashAlg[hash === 'SHA1' ? 'Sha1' : hash === 'SHA384' ? 'Sha384' : hash === 'SHA512' ? 'Sha512' : 'Sha256'];
    const label = options?.label ? this.toBuffer(options.label) : undefined;
    const out: Uint8Array = this.wasm.rsa_oaep_decrypt(ct, sk, hashEnum, label);
    return Buffer.from(out);
  }
}

class X25519 extends BaseCipher {
  private wasm: any;
  constructor() {
    const p = path.join(__dirname, 'x25519_wasm', 'x25519_wasm.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    super(null);
    this.wasm = require(p);
  }
  generateKeypair(): { privateKey: Buffer; publicKey: Buffer } {
    const arr = this.wasm.x25519_generate_keypair();
    return { privateKey: Buffer.from(arr[0]), publicKey: Buffer.from(arr[1]) };
  }
  deriveSharedSecret(privateKey: CryptoInput, peerPublicKey: CryptoInput): Buffer {
    const sk = this.toBuffer(privateKey);
    const pk = this.toBuffer(peerPublicKey);
    const ss: Uint8Array = this.wasm.x25519_derive_shared_secret(sk, pk);
    return Buffer.from(ss);
  }
}

class ECDH extends BaseCipher {
  private wasm: any;
  constructor() {
    super(null);
    try {
      const p = path.join(__dirname, 'ecdh_wasm', 'ecdh_wasm.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.wasm = require(p);
    } catch (_e) {
      this.wasm = null;
    }
  }
  generateKeypair(curve: 'p256' | 'p384' = 'p256'): { privateKey: Buffer; publicKey: Buffer } {
    if (!this.wasm) throw new Error('ECDH module not available in this build');
    const arr = this.wasm.ecdh_generate_keypair(curve);
    return { privateKey: Buffer.from(arr[0]), publicKey: Buffer.from(arr[1]) };
  }
  deriveSharedSecret(curve: 'p256' | 'p384', privateKey: CryptoInput, peerPublicKey: CryptoInput): Buffer {
    if (!this.wasm) throw new Error('ECDH module not available in this build');
    const sk = this.toBuffer(privateKey);
    const pk = this.toBuffer(peerPublicKey);
    const ss: Uint8Array = this.wasm.ecdh_derive_shared_secret(curve, sk, pk);
    return Buffer.from(ss);
  }
}

export const rsa_oaep = new (RSAOAEP as any)();
export const x25519 = new (X25519 as any)();
export const ecdh = new (ECDH as any)();

// Export all cipher functions as an object
export const cipher = {
  aes,
  chacha20,
  des,
};
