import * as blake2_wasm from '../../packages/blake2_wasm';
import * as blake3_wasm from '../../packages/blake3_wasm';
import * as md4_wasm from '../../packages/md4_wasm';
import * as md5_wasm from '../../packages/md5_wasm';
import * as ripemd160_wasm from '../../packages/ripemd160_wasm';
import * as sha1_wasm from '../../packages/sha1_wasm';
import * as sha2_wasm from '../../packages/sha2_wasm';
import * as sha3_wasm from '../../packages/sha3_wasm';
import * as whirlpool_wasm from '../../packages/whirlpool_wasm';
import { CryptoHasher } from 'bun';
import SHA256 from 'crypto-js/sha256';

// Hàm kiểm tra BLAKE2 WASM
function testBlake2WASMHash(input: Buffer, expectedLen: number, options: { algo: 'blake2b' | 'blake2s' }): boolean {
  try {
    const outBuf = blake2_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE2 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testBlake2WASMHash failed: ${e}`);
    return false;
  }
}

function testBlake2StreamingHash(input: Buffer, expectedLen: number, options: { algo: 'blake2b' | 'blake2s' }): boolean {
  try {
    const hasher = new blake2_wasm.StreamingHasher(options);
    hasher.update(input);
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE2 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testBlake2StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra BLAKE3 WASM
function testBlake3WASMHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const outBuf = blake3_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE3 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testBlake3WASMHash failed: ${e}`);
    return false;
  }
}

function testBlake3StreamingHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const hasher = new blake3_wasm.StreamingHasher(options);
    hasher.update(input);
    const outBuf = options.hash_length ? hasher.finalize_xof(options.hash_length) : hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`BLAKE3 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testBlake3StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra MD4 WASM
function testMD4WASMHash(input: Buffer, expectedLen: number, options: { hash_length?: number }): boolean {
  try {
    const outBuf = md4_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD4 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testMD4WASMHash failed: ${e}`);
    return false;
  }
}

function testMD4StreamingHash(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new md4_wasm.StreamingHasher();
    hasher.update(input);
    const outBuf = expectedLen ? hasher.finalize_xof(expectedLen) : hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD4 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testMD4StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra MD5 WASM
function testMD5WASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = md5_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD5 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testMD5WASMHash failed: ${e}`);
    return false;
  }
}

function testMD5StreamingHash(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new md5_wasm.StreamingMd5();
    hasher.update(input);
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`MD5 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testMD5StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra RIPEMD160 WASM
function testRIPEMD160WASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = ripemd160_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`RIPEMD160 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testRIPEMD160WASMHash failed: ${e}`);
    return false;
  }
}

function testRIPEMD160StreamingHash(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new ripemd160_wasm.StreamingHasher();
    hasher.update(input);
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`RIPEMD160 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testRIPEMD160StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra SHA1 WASM
function testSHA1WASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = sha1_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA1 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSHA1WASMHash failed: ${e}`);
    return false;
  }
}

function testSHA1StreamingHash(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new sha1_wasm.StreamingSha1();
    hasher.update(input);
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA1 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSHA1StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra SHA2 WASM
function testSHA2WASMHash(input: Buffer, expectedLen: number, options: { algo?: 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha512_224' | 'sha512_256' }): boolean {
  try {
    const outBuf = sha2_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA2 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSHA2WASMHash failed: ${e}`);
    return false;
  }
}

function testSHA2StreamingHash(input: Buffer, expectedLen: number, options: { algo?: 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha512_224' | 'sha512_256' }): boolean {
  try {
    const hasher = new sha2_wasm.StreamingHasher(options);
    hasher.update(input);
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA2 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSHA2StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra SHA3 WASM
function testSHA3WASMHash(input: Buffer, expectedLen: number, options: { algo: 'sha3_224' | 'sha3_256' | 'sha3_384' | 'sha3_512' | 'shake128' | 'shake256' | 'keccak224' | 'keccak256' | 'keccak384' | 'keccak512'; hash_length?: number }): boolean {
  try {
    const outBuf = sha3_wasm.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA3 WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSHA3WASMHash failed: ${e}`);
    return false;
  }
}

function testSHA3StreamingHash(input: Buffer, expectedLen: number, options: { algo: 'sha3_224' | 'sha3_256' | 'sha3_384' | 'sha3_512' | 'shake128' | 'shake256' | 'keccak224' | 'keccak256' | 'keccak384' | 'keccak512'; hash_length?: number }): boolean {
  try {
    const hasher = new sha3_wasm.StreamingHasher(options);
    hasher.update(input);
    const outBuf = hasher.finalize(options.hash_length);
    if (outBuf.length !== expectedLen) {
      throw new Error(`SHA3 streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSHA3StreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra Whirlpool WASM
function testWhirlpoolWASMHash(input: Buffer, expectedLen: number): boolean {
  try {
    const outBuf = whirlpool_wasm.hash(input);
    if (outBuf.length !== expectedLen) {
      throw new Error(`Whirlpool WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testWhirlpoolWASMHash failed: ${e}`);
    return false;
  }
}

function testWhirlpoolStreamingHash(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new whirlpool_wasm.StreamingHasher();
    hasher.update(input);
    const outBuf = hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`Whirlpool streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testWhirlpoolStreamingHash failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra Bun SHA-256
function testSingleBunSha256(input: Buffer, expectedLen: number): boolean {
  try {
    const hasher = new CryptoHasher('sha256');
    hasher.update(input);
    const outBuf = hasher.digest();
    if (outBuf.length !== expectedLen) {
      throw new Error(`Bun SHA-256 hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSingleBunSha256 failed: ${e}`);
    return false;
  }
}

// Hàm kiểm tra CryptoJS SHA-256
function testCryptoJsSha256(input: Buffer, expectedLen: number): boolean {
  try {
    const hash = SHA256(input.toString('binary')).toString();
    const outBuf = Buffer.from(hash, 'hex');
    if (outBuf.length !== expectedLen) {
      throw new Error(`CryptoJS SHA-256 hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testCryptoJsSha256 failed: ${e}`);
    return false;
  }
}

// Hàm benchmark
async function benchmark() {
  const inputSmall = Buffer.from('Hello, Bun.js!');
  const input1MB = Buffer.alloc(1_000_000, 0x42); // 1MB
  const iterations = 10_000;
  const keyed = new Uint8Array(32).fill(0x42);
  const derive_key = 'context';

  // BLAKE2
  console.time('BLAKE2b WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake2WASMHash(inputSmall, 64, { algo: 'blake2b' });
  }
  console.timeEnd('BLAKE2b WASM (default, small)');

  console.time('BLAKE2b WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake2StreamingHash(inputSmall, 64, { algo: 'blake2b' });
  }
  console.timeEnd('BLAKE2b WASM (streaming, small)');

  console.time('BLAKE2s WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake2WASMHash(inputSmall, 32, { algo: 'blake2s' });
  }
  console.timeEnd('BLAKE2s WASM (default, small)');

  console.time('BLAKE2s WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake2StreamingHash(inputSmall, 32, { algo: 'blake2s' });
  }
  console.timeEnd('BLAKE2s WASM (streaming, small)');

  // BLAKE3
  console.time('BLAKE3 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake3WASMHash(inputSmall, 32, {});
  }
  console.timeEnd('BLAKE3 WASM (default, small)');

  console.time('BLAKE3 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake3StreamingHash(inputSmall, 32, {});
  }
  console.timeEnd('BLAKE3 WASM (streaming, small)');

  console.time('BLAKE3 WASM Keyed (default, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake3WASMHash(inputSmall, 32, { keyed });
  }
  console.timeEnd('BLAKE3 WASM Keyed (default, small)');

  console.time('BLAKE3 WASM Derive Key (default, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake3WASMHash(inputSmall, 32, { derive_key });
  }
  console.timeEnd('BLAKE3 WASM Derive Key (default, small)');

  console.time('BLAKE3 WASM XOF (default, small, 64 bytes)');
  for (let i = 0; i < iterations; i++) {
    testBlake3WASMHash(inputSmall, 64, { hash_length: 64 });
  }
  console.timeEnd('BLAKE3 WASM XOF (default, small, 64 bytes)');

  console.time('BLAKE3 WASM XOF (streaming, small, 64 bytes)');
  for (let i = 0; i < iterations; i++) {
    testBlake3StreamingHash(inputSmall, 64, { hash_length: 64 });
  }
  console.timeEnd('BLAKE3 WASM XOF (streaming, small, 64 bytes)');

  // MD4
  console.time('MD4 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testMD4WASMHash(inputSmall, 16, {});
  }
  console.timeEnd('MD4 WASM (default, small)');

  console.time('MD4 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testMD4StreamingHash(inputSmall, 16);
  }
  console.timeEnd('MD4 WASM (streaming, small)');

  // MD5
  console.time('MD5 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testMD5WASMHash(inputSmall, 16);
  }
  console.timeEnd('MD5 WASM (default, small)');

  console.time('MD5 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testMD5StreamingHash(inputSmall, 16);
  }
  console.timeEnd('MD5 WASM (streaming, small)');

  // RIPEMD160
  console.time('RIPEMD160 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testRIPEMD160WASMHash(inputSmall, 20);
  }
  console.timeEnd('RIPEMD160 WASM (default, small)');

  console.time('RIPEMD160 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testRIPEMD160StreamingHash(inputSmall, 20);
  }
  console.timeEnd('RIPEMD160 WASM (streaming, small)');

  // SHA1
  console.time('SHA1 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA1WASMHash(inputSmall, 20);
  }
  console.timeEnd('SHA1 WASM (default, small)');

  console.time('SHA1 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA1StreamingHash(inputSmall, 20);
  }
  console.timeEnd('SHA1 WASM (streaming, small)');

  // SHA2
  console.time('SHA2-256 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA2WASMHash(inputSmall, 32, { algo: 'sha256' });
  }
  console.timeEnd('SHA2-256 WASM (default, small)');

  console.time('SHA2-256 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA2StreamingHash(inputSmall, 32, { algo: 'sha256' });
  }
  console.timeEnd('SHA2-256 WASM (streaming, small)');

  // SHA3
  console.time('SHA3-256 WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA3WASMHash(inputSmall, 32, { algo: 'sha3_256' });
  }
  console.timeEnd('SHA3-256 WASM (default, small)');

  console.time('SHA3-256 WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA3StreamingHash(inputSmall, 32, { algo: 'sha3_256' });
  }
  console.timeEnd('SHA3-256 WASM (streaming, small)');

  console.time('SHAKE128 WASM (default, small, 64 bytes)');
  for (let i = 0; i < iterations; i++) {
    testSHA3WASMHash(inputSmall, 64, { algo: 'shake128', hash_length: 64 });
  }
  console.timeEnd('SHAKE128 WASM (default, small, 64 bytes)');

  console.time('SHAKE128 WASM (streaming, small, 64 bytes)');
  for (let i = 0; i < iterations; i++) {
    testSHA3StreamingHash(inputSmall, 64, { algo: 'shake128', hash_length: 64 });
  }
  console.timeEnd('SHAKE128 WASM (streaming, small, 64 bytes)');

  // Whirlpool
  console.time('Whirlpool WASM (default, small)');
  for (let i = 0; i < iterations; i++) {
    testWhirlpoolWASMHash(inputSmall, 64);
  }
  console.timeEnd('Whirlpool WASM (default, small)');

  console.time('Whirlpool WASM (streaming, small)');
  for (let i = 0; i < iterations; i++) {
    testWhirlpoolStreamingHash(inputSmall, 64);
  }
  console.timeEnd('Whirlpool WASM (streaming, small)');

  // Bun SHA-256
  console.time('Bun SHA-256 (small)');
  for (let i = 0; i < iterations; i++) {
    testSingleBunSha256(inputSmall, 32);
  }
  console.timeEnd('Bun SHA-256 (small)');

  // CryptoJS SHA-256
  console.time('CryptoJS SHA-256 (small)');
  for (let i = 0; i < iterations; i++) {
    testCryptoJsSha256(inputSmall, 32);
  }
  console.timeEnd('CryptoJS SHA-256 (small)');

  // Benchmark với input 1MB
  console.time('BLAKE2b WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testBlake2WASMHash(input1MB, 64, { algo: 'blake2b' });
  }
  console.timeEnd('BLAKE2b WASM (default, 1MB)');

  console.time('BLAKE2b WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testBlake2StreamingHash(input1MB, 64, { algo: 'blake2b' });
  }
  console.timeEnd('BLAKE2b WASM (streaming, 1MB)');

  console.time('BLAKE3 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testBlake3WASMHash(input1MB, 32, {});
  }
  console.timeEnd('BLAKE3 WASM (default, 1MB)');

  console.time('BLAKE3 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testBlake3StreamingHash(input1MB, 32, {});
  }
  console.timeEnd('BLAKE3 WASM (streaming, 1MB)');

  console.time('MD4 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testMD4WASMHash(input1MB, 16, {});
  }
  console.timeEnd('MD4 WASM (default, 1MB)');

  console.time('MD4 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testMD4StreamingHash(input1MB, 16);
  }
  console.timeEnd('MD4 WASM (streaming, 1MB)');

  console.time('MD5 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testMD5WASMHash(input1MB, 16);
  }
  console.timeEnd('MD5 WASM (default, 1MB)');

  console.time('MD5 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testMD5StreamingHash(input1MB, 16);
  }
  console.timeEnd('MD5 WASM (streaming, 1MB)');

  console.time('RIPEMD160 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testRIPEMD160WASMHash(input1MB, 20);
  }
  console.timeEnd('RIPEMD160 WASM (default, 1MB)');

  console.time('RIPEMD160 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testRIPEMD160StreamingHash(input1MB, 20);
  }
  console.timeEnd('RIPEMD160 WASM (streaming, 1MB)');

  console.time('SHA1 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testSHA1WASMHash(input1MB, 20);
  }
  console.timeEnd('SHA1 WASM (default, 1MB)');

  console.time('SHA1 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testSHA1StreamingHash(input1MB, 20);
  }
  console.timeEnd('SHA1 WASM (streaming, 1MB)');

  console.time('SHA2-256 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testSHA2WASMHash(input1MB, 32, { algo: 'sha256' });
  }
  console.timeEnd('SHA2-256 WASM (default, 1MB)');

  console.time('SHA2-256 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testSHA2StreamingHash(input1MB, 32, { algo: 'sha256' });
  }
  console.timeEnd('SHA2-256 WASM (streaming, 1MB)');

  console.time('SHA3-256 WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testSHA3WASMHash(input1MB, 32, { algo: 'sha3_256' });
  }
  console.timeEnd('SHA3-256 WASM (default, 1MB)');

  console.time('SHA3-256 WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testSHA3StreamingHash(input1MB, 32, { algo: 'sha3_256' });
  }
  console.timeEnd('SHA3-256 WASM (streaming, 1MB)');

  console.time('Whirlpool WASM (default, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testWhirlpoolWASMHash(input1MB, 64);
  }
  console.timeEnd('Whirlpool WASM (default, 1MB)');

  console.time('Whirlpool WASM (streaming, 1MB)');
  for (let i = 0; i < iterations / 10; i++) {
    testWhirlpoolStreamingHash(input1MB, 64);
  }
  console.timeEnd('Whirlpool WASM (streaming, 1MB)');
}

// Hàm kiểm tra
async function runTest(): Promise<void> {
  const inputSmall = Buffer.from('Hello, Bun.js!');
  const keyed = new Uint8Array(32).fill(0x42);
  const derive_key = 'context';

  console.log('Testing BLAKE2b WASM (default)...');
  if (!testBlake2WASMHash(inputSmall, 64, { algo: 'blake2b' })) {
    console.error('Aborting due to BLAKE2b WASM default hash failure');
    return;
  }

  console.log('Testing BLAKE2b WASM (streaming)...');
  if (!testBlake2StreamingHash(inputSmall, 64, { algo: 'blake2b' })) {
    console.error('Aborting due to BLAKE2b WASM streaming hash failure');
    return;
  }

  console.log('Testing BLAKE2s WASM (default)...');
  if (!testBlake2WASMHash(inputSmall, 32, { algo: 'blake2s' })) {
    console.error('Aborting due to BLAKE2s WASM default hash failure');
    return;
  }

  console.log('Testing BLAKE2s WASM (streaming)...');
  if (!testBlake2StreamingHash(inputSmall, 32, { algo: 'blake2s' })) {
    console.error('Aborting due to BLAKE2s WASM streaming hash failure');
    return;
  }

  console.log('Testing BLAKE3 WASM (default)...');
  if (!testBlake3WASMHash(inputSmall, 32, {})) {
    console.error('Aborting due to BLAKE3 WASM default hash failure');
    return;
  }

  console.log('Testing BLAKE3 WASM (streaming)...');
  if (!testBlake3StreamingHash(inputSmall, 32, {})) {
    console.error('Aborting due to BLAKE3 WASM streaming hash failure');
    return;
  }

  console.log('Testing BLAKE3 WASM Keyed (default)...');
  if (!testBlake3WASMHash(inputSmall, 32, { keyed })) {
    console.error('Aborting due to BLAKE3 WASM keyed hash failure');
    return;
  }

  console.log('Testing BLAKE3 WASM Derive Key (default)...');
  if (!testBlake3WASMHash(inputSmall, 32, { derive_key })) {
    console.error('Aborting due to BLAKE3 WASM derive_key hash failure');
    return;
  }

  console.log('Testing BLAKE3 WASM XOF (default)...');
  if (!testBlake3WASMHash(inputSmall, 64, { hash_length: 64 })) {
    console.error('Aborting due to BLAKE3 WASM XOF default hash failure');
    return;
  }

  console.log('Testing BLAKE3 WASM XOF (streaming)...');
  if (!testBlake3StreamingHash(inputSmall, 64, { hash_length: 64 })) {
    console.error('Aborting due to BLAKE3 WASM XOF streaming hash failure');
    return;
  }

  console.log('Testing MD4 WASM (default)...');
  if (!testMD4WASMHash(inputSmall, 16, {})) {
    console.error('Aborting due to MD4 WASM default hash failure');
    return;
  }

  console.log('Testing MD4 WASM (streaming)...');
  if (!testMD4StreamingHash(inputSmall, 16)) {
    console.error('Aborting due to MD4 WASM streaming hash failure');
    return;
  }

  console.log('Testing MD5 WASM (default)...');
  if (!testMD5WASMHash(inputSmall, 16)) {
    console.error('Aborting due to MD5 WASM default hash failure');
    return;
  }

  console.log('Testing MD5 WASM (streaming)...');
  if (!testMD5StreamingHash(inputSmall, 16)) {
    console.error('Aborting due to MD5 WASM streaming hash failure');
    return;
  }

  console.log('Testing RIPEMD160 WASM (default)...');
  if (!testRIPEMD160WASMHash(inputSmall, 20)) {
    console.error('Aborting due to RIPEMD160 WASM default hash failure');
    return;
  }

  console.log('Testing RIPEMD160 WASM (streaming)...');
  if (!testRIPEMD160StreamingHash(inputSmall, 20)) {
    console.error('Aborting due to RIPEMD160 WASM streaming hash failure');
    return;
  }

  console.log('Testing SHA1 WASM (default)...');
  if (!testSHA1WASMHash(inputSmall, 20)) {
    console.error('Aborting due to SHA1 WASM default hash failure');
    return;
  }

  console.log('Testing SHA1 WASM (streaming)...');
  if (!testSHA1StreamingHash(inputSmall, 20)) {
    console.error('Aborting due to SHA1 WASM streaming hash failure');
    return;
  }

  console.log('Testing SHA2-256 WASM (default)...');
  if (!testSHA2WASMHash(inputSmall, 32, { algo: 'sha256' })) {
    console.error('Aborting due to SHA2-256 WASM default hash failure');
    return;
  }

  console.log('Testing SHA2-256 WASM (streaming)...');
  if (!testSHA2StreamingHash(inputSmall, 32, { algo: 'sha256' })) {
    console.error('Aborting due to SHA2-256 WASM streaming hash failure');
    return;
  }

  console.log('Testing SHA3-256 WASM (default)...');
  if (!testSHA3WASMHash(inputSmall, 32, { algo: 'sha3_256' })) {
    console.error('Aborting due to SHA3-256 WASM default hash failure');
    return;
  }

  console.log('Testing SHA3-256 WASM (streaming)...');
  if (!testSHA3StreamingHash(inputSmall, 32, { algo: 'sha3_256' })) {
    console.error('Aborting due to SHA3-256 WASM streaming hash failure');
    return;
  }

  console.log('Testing Whirlpool WASM (default)...');
  if (!testWhirlpoolWASMHash(inputSmall, 64)) {
    console.error('Aborting due to Whirlpool WASM default hash failure');
    return;
  }

  console.log('Testing Whirlpool WASM (streaming)...');
  if (!testWhirlpoolStreamingHash(inputSmall, 64)) {
    console.error('Aborting due to Whirlpool WASM streaming hash failure');
    return;
  }

  console.log('Testing Bun SHA-256...');
  if (!testSingleBunSha256(inputSmall, 32)) {
    console.error('Aborting due to Bun SHA-256 hash failure');
    return;
  }

  console.log('Testing CryptoJS SHA-256...');
  if (!testCryptoJsSha256(inputSmall, 32)) {
    console.error('Aborting due to CryptoJS SHA-256 hash failure');
    return;
  }

  console.log('Running benchmark...');
  await benchmark();
}

runTest().catch((e) => console.error('Test crashed:', e));