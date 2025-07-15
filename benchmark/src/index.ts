import * as blake2_wasm from '../../packages/sha/blake2_wasm';
import * as blake3_wasm from '../../packages/sha/blake3_wasm';
import * as md4_wasm from '../../packages/sha/md4_wasm';
import * as md5_wasm from '../../packages/sha/md5_wasm';
import * as ripemd160_wasm from '../../packages/sha/ripemd160_wasm';
import * as sha1_wasm from '../../packages/sha/sha1_wasm';
import * as sha2_wasm from '../../packages/sha/sha2_wasm';
import * as sha3_wasm from '../../packages/sha/sha3_wasm';
import * as whirlpool_wasm from '../../packages/sha/whirlpool_wasm';
import * as hmac_wasm from '../../packages/hmac/hmac_wasm';
import * as bcrypt_wasm from '../../packages/pha/bcrypt_wasm';
import { CryptoHasher } from 'bun';
import SHA256 from 'crypto-js/sha256';

function benchmarkBlake2WASMHash(input: Buffer, expectedLen: number, options: { algo: 'blake2b' | 'blake2s' }): boolean {
  try {
    const outBuf = blake2_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE2 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkBlake2WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkBlake2StreamingHash(input: Buffer, expectedLen: number, options: { algo: 'blake2b' | 'blake2s' }, chunkSize: number): boolean {
  try {
    const hasher = new blake2_wasm.StreamingHasher(options);
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE2 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkBlake2StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra BLAKE3 WASM
function benchmarkBlake3WASMHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const outBuf = blake3_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE3 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkBlake3WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkBlake3StreamingHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }, chunkSize: number): boolean {
  try {
    const hasher = new blake3_wasm.StreamingHasher(options);
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = options.hash_length ? hasher.finalize_xof(options.hash_length) : hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE3 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkBlake3StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkMD4WASMHash(input: Buffer, expectedLen: number, options: { hash_length?: number }): boolean {
  try {
    const outBuf = md4_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD4 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkMD4WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkMD4StreamingHash(input: Buffer, expectedLen: number, chunkSize: number): boolean {
  try {
    const hasher = new md4_wasm.StreamingHasher();
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD4 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkMD4StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkMD5WASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = md5_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD5 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkMD5WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkMD5StreamingHash(input: Buffer, expectedLen: number, chunkSize: number): boolean {
  try {
    const hasher = new md5_wasm.StreamingMd5();
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD5 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkMD5StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkRIPEMD160WASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = ripemd160_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`RIPEMD160 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkRIPEMD160WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkRIPEMD160StreamingHash(input: Buffer, expectedLen: number, chunkSize: number): boolean {
  try {
    const hasher = new ripemd160_wasm.StreamingHasher();
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`RIPEMD160 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkRIPEMD160StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkSHA1WASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = sha1_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA1 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSHA1WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkSHA1StreamingHash(input: Buffer, expectedLen: number, chunkSize: number): boolean {
  try {
    const hasher = new sha1_wasm.StreamingSha1();
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA1 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSHA1StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkSHA2WASMHash(input: Buffer, expectedLen: number, options: { algo?: 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha512_224' | 'sha512_256' }): boolean {
  try {
    const outBuf = sha2_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA2 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSHA2WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkSHA2StreamingHash(input: Buffer, expectedLen: number, options: { algo?: 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha512_224' | 'sha512_256' }, chunkSize: number): boolean {
  try {
    const hasher = new sha2_wasm.StreamingHasher(options);
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA2 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSHA2StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkSHA3WASMHash(input: Buffer, expectedLen: number, options: { algo: 'sha3_224' | 'sha3_256' | 'sha3_384' | 'sha3_512' | 'shake128' | 'shake256' | 'keccak224' | 'keccak256' | 'keccak384' | 'keccak512'; hash_length?: number }): boolean {
  try {
    const outBuf = sha3_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA3 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSHA3WASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkSHA3StreamingHash(input: Buffer, expectedLen: number, options: { algo: 'sha3_224' | 'sha3_256' | 'sha3_384' | 'sha3_512' | 'shake128' | 'shake256' | 'keccak224' | 'keccak256' | 'keccak384' | 'keccak512'; hash_length?: number }, chunkSize: number): boolean {
  try {
    const hasher = new sha3_wasm.StreamingHasher(options);
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize(options.hash_length);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA3 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSHA3StreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkWhirlpoolWASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = whirlpool_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`Whirlpool WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkWhirlpoolWASMHash failed: ${e}`);
    return false;
  }
}

function benchmarkWhirlpoolStreamingHash(input: Buffer, expectedLen: number, chunkSize: number): boolean {
  try {
    const hasher = new whirlpool_wasm.StreamingHasher();
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`Whirlpool streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkWhirlpoolStreamingHash failed: ${e}`);
    return false;
  }
}

function benchmarkSingleBunSha256(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new CryptoHasher('sha256');
    hasher.update(input);
    const outBuf = hasher.digest();
    if (outBuf.length !== expectedLen) {
      throw new Error(`Bun SHA-256 hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkSingleBunSha256 failed: ${e}`);
    return false;
  }
}

function benchmarkCryptoJsSha256(input: Buffer, expectedLen: number): boolean {
  try {
    const hash = SHA256(input.toString('binary')).toString();
    const outBuf = Buffer.from(hash, 'hex');
    if (outBuf.length !== expectedLen) {
      throw new Error(`CryptoJS SHA-256 hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`benchmarkCryptoJsSha256 failed: ${e}`);
    return false;
  }
}

function testHmacWASMHash(
  key: Uint8Array,
  input: Buffer,
  algo: number,
  expectedLen: number
): boolean {
  try {
    const outBuf = hmac_wasm.hmac(key, input, algo);
    if (outBuf.length !== expectedLen) {
      throw new Error(
        `HMAC WASM hash failed for algo ${algo}: returned len=${outBuf.length}, expected=${expectedLen}`
      );
    }
    return true;
  } catch (e) {
    console.error(`testHmacWASMHash failed for algo ${algo}: ${e}`);
    return false;
  }
}


// Hàm benchmark Bcrypt WASM
function benchmarkBcryptWASMHash(input: Buffer, cost = 10) {
  try {
    const inputArray = new Uint8Array(input);
    const options = { cost };
    const hashed = bcrypt_wasm.hash_password(inputArray, options);
    if (typeof hashed !== 'string' || hashed.length < 59) { // bcrypt hash thường dài ~60 ký tự
      throw new Error(`Bcrypt WASM hash failed: invalid hash length`);
    }
    return hashed; // Trả về hash để sử dụng trong benchmark verify
  } catch (e) {
    console.error(`benchmarkBcryptWASMHash failed: ${e}`);
    return null;
  }
}

function benchmarkBcryptWASMVerify(input: Buffer, hashed: string) {
  try {
    const inputArray = new Uint8Array(input);
    const result = bcrypt_wasm.verify_password(inputArray, hashed);
    if (typeof result !== 'boolean') {
      throw new Error(`Bcrypt WASM verify failed: invalid result`);
    }
    return result;
  } catch (e) {
    console.error(`benchmarkBcryptWASMVerify failed: ${e}`);
    return false;
  }
}

function testHmacStreamingHash(
  key: Uint8Array,
  input: Buffer,
  algo: number,
  expectedLen: number,
  chunkSize: number
): boolean {
  try {
    const hasher = new hmac_wasm.StreamingHmac(key, algo);
    let pos = 0;
    while (pos < input.length) {
      const end = Math.min(pos + chunkSize, input.length);
      hasher.update(input.subarray(pos, end));
      pos = end;
    }
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(
        `HMAC streaming hash failed for algo ${algo}: returned len=${outBuf.length}, expected=${expectedLen}`
      );
    }
    return true;
  } catch (e) {
    console.error(`testHmacStreamingHash failed for algo ${algo}: ${e}`);
    return false;
  }
}

async function benchmark() {
  const inputSmall = Buffer.from('Hello, Bun.js!');
  const iterations = 10_000;
  const chunkSize = 65536;
  const keyed = new Uint8Array(32).fill(0x42);
  const derive_key = 'context';

  // BLAKE2
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake2WASMHash(inputSmall, 64, { algo: 'blake2b' });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE2b WASM (default, 64): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake2StreamingHash(inputSmall, 32, { algo: 'blake2s' }, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE2s WASM (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  // BLAKE3
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake3WASMHash(inputSmall, 32, {});
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE3 WASM (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake3StreamingHash(inputSmall, 32, {}, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE3 WASM (streaming, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake3WASMHash(inputSmall, 32, { keyed });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE3 WASM Keyed (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake3WASMHash(inputSmall, 32, { derive_key });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE3 WASM Derive Key (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake3WASMHash(inputSmall, 64, { hash_length: 64 });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE3 WASM XOF (default, 64): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkBlake3StreamingHash(inputSmall, 64, { hash_length: 64 }, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BLAKE3 WASM XOF (streaming, 64): ${averageTime.toFixed(7)} ms`);
  }

  // MD4
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkMD4WASMHash(inputSmall, 16, {});
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`MD4 WASM (default, 16): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkMD4StreamingHash(inputSmall, 16, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`MD4 WASM (streaming, 16): ${averageTime.toFixed(7)} ms`);
  }

  // MD5
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkMD5WASMHash(inputSmall, 16);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`MD5 WASM (default, 16): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkMD5StreamingHash(inputSmall, 16, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`MD5 WASM (streaming, 16): ${averageTime.toFixed(7)} ms`);
  }

  // RIPEMD160
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkRIPEMD160WASMHash(inputSmall, 20);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`RIPEMD160 WASM (default, 20): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkRIPEMD160StreamingHash(inputSmall, 20, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`RIPEMD160 WASM (streaming, 20): ${averageTime.toFixed(7)} ms`);
  }

  // SHA1
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA1WASMHash(inputSmall, 20);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHA1 WASM (default, 20): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA1StreamingHash(inputSmall, 20, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHA1 WASM (streaming, 20): ${averageTime.toFixed(7)} ms`);
  }

  // SHA2
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA2WASMHash(inputSmall, 32, { algo: 'sha256' });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHA2-256 WASM (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA2StreamingHash(inputSmall, 32, { algo: 'sha256' }, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHA2-256 WASM (streaming, 32): ${averageTime.toFixed(7)} ms`);
  }

  // SHA3
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA3WASMHash(inputSmall, 32, { algo: 'sha3_256' });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHA3-256 WASM (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA3StreamingHash(inputSmall, 32, { algo: 'sha3_256' }, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHA3-256 WASM (streaming, 32): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA3WASMHash(inputSmall, 64, { algo: 'shake128', hash_length: 64 });
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHAKE128 WASM (default, 64): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSHA3StreamingHash(inputSmall, 64, { algo: 'shake128', hash_length: 64 }, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`SHAKE128 WASM (streaming, 64): ${averageTime.toFixed(7)} ms`);
  }

  // Whirlpool
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkWhirlpoolWASMHash(inputSmall, 64);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`WHIRLPOOL WASM (default, 64): ${averageTime.toFixed(7)} ms`);
  }

  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkWhirlpoolStreamingHash(inputSmall, 64, chunkSize);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`WHIRLPOOL WASM (streaming, 64): ${averageTime.toFixed(7)} ms`);
  }

  // Bun SHA-256
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkSingleBunSha256(inputSmall, 32);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BUN-SHA-256 (default, 64): ${averageTime.toFixed(7)} ms`);
  }

  // CryptoJS SHA-256
  {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      benchmarkCryptoJsSha256(inputSmall, 32);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`CRYPTOJS SHA-256 (default, 32): ${averageTime.toFixed(7)} ms`);
  }

  // Bcrypt WASM
  {
    const iterations = 4;

    let hashedPassword;
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      hashedPassword = benchmarkBcryptWASMHash(inputSmall, 10);
      console.log(`BCRYPT WASM Hash (cost=10): ${hashedPassword}`);
      
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`BCRYPT WASM Hash (cost=10): ${averageTime.toFixed(7)} ms`);

    if (hashedPassword) {
      const startTimeVerify = performance.now();
      for (let i = 0; i < iterations; i++) {
        benchmarkBcryptWASMVerify(inputSmall, hashedPassword);
      }
      const endTimeVerify = performance.now();
      const totalTimeVerify = endTimeVerify - startTimeVerify;
      const averageTimeVerify = totalTimeVerify / iterations;
      console.log(`BCRYPT WASM Verify (cost=10): ${averageTimeVerify.toFixed(7)} ms`);
    }
  }

  // HMAC benchmarks
  const key = new Uint8Array(32).fill(0x42);

  const hashLengths: { [key: number]: number } = {
    0: 16, // md4
    1: 16, // md5
    2: 20, // sha1
    3: 28, // sha224
    4: 32, // sha256
    5: 48, // sha384
    6: 64, // sha512
    7: 28, // sha512_224
    8: 32, // sha512_256
    9: 28, // sha3_224
    10: 32, // sha3_256
    11: 48, // sha3_384
    12: 64, // sha3_512
    13: 20, // ripemd160
    14: 32, // ripemd256
    15: 40, // ripemd320
    16: 64, // whirlpool
  };

  const algorithms = [
    0,  // md4
    1,  // md5
    2,  // sha1
    3,  // sha224
    4,  // sha256
    5,  // sha384
    6,  // sha512
    7,  // sha512_224
    8,  // sha512_256
    9,  // sha3_224
    10, // sha3_256
    11, // sha3_384
    12, // sha3_512
    13, // ripemd160
    14, // ripemd256
    15, // ripemd320
    16, // whirlpool
  ];

  const algorithmNames = [
    'md4',
    'md5',
    'sha1',
    'sha224',
    'sha256',
    'sha384',
    'sha512',
    'sha512_224',
    'sha512_256',
    'sha3_224',
    'sha3_256',
    'sha3_384',
    'sha3_512',
    'ripemd160',
    'ripemd256',
    'ripemd320',
    'whirlpool'
  ];

  for (const algo of algorithms) {
    const expectedLen = hashLengths[algo] as number;

    // HMAC one-shot (small input)
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      testHmacWASMHash(key, inputSmall, algo, expectedLen);
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    console.log(`HMAC algo ${algorithmNames[algo]} WASM (default, small): ${averageTime.toFixed(7)} ms`);

    // HMAC streaming (small input)
    const startTimeStreaming = performance.now();
    for (let i = 0; i < iterations; i++) {
      testHmacStreamingHash(key, inputSmall, algo, expectedLen, chunkSize);
    }
    const endTimeStreaming = performance.now();
    const totalTimeStreaming = endTimeStreaming - startTimeStreaming;
    const averageTimeStreaming = totalTimeStreaming / iterations;
    console.log(`HMAC algo ${algorithmNames[algo]} WASM (streaming, small): ${averageTimeStreaming.toFixed(7)} ms`);
  }
}

async function runBenchmark(): Promise<void> {
  console.log('Running benchmark...');
  await benchmark();
}

runBenchmark().catch((e) => console.error('Benchmark crashed:', e));