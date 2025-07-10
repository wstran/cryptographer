import * as blake3 from '../../packages/blake3_wasm';
import * as sha2_wasm from '../../packages/sha2_wasm';
import { CryptoHasher } from 'bun';
import SHA256 from 'crypto-js/sha256';
import * as blake3_wasm_import from 'blake3';

await blake3_wasm_import.load();

function testSHA2WASMHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const outBuf = sha2_wasm.hash(input, { algo: 'sha256' });
    if (outBuf.length !== expectedLen) {
      throw new Error(`WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSingleWasmHash failed: ${e}`);
    return false;
  }
}

function testBlake3ImportHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const outBuf = blake3_wasm_import.hash(input, { length: options.hash_length });
    if (outBuf.length !== expectedLen) {
      throw new Error(`WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSingleWasmHash failed: ${e}`);
    return false;
  }
}

// Test WASM BLAKE3 hash
function testSingleWasmHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const outBuf = blake3.hash(input, options);
    if (outBuf.length !== expectedLen) {
      throw new Error(`WASM hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testSingleWasmHash failed: ${e}`);
    return false;
  }
}

// Test WASM BLAKE3 streaming hash
function testStreamingWasmHash(input: Buffer, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
  try {
    const hasher = new blake3.StreamingHasher(options);
    hasher.update(input);
    const outBuf = options.hash_length ? hasher.finalize_xof(options.hash_length) : hasher.finalize();
    if (outBuf.length !== expectedLen) {
      throw new Error(`WASM streaming hash failed: returned len=${outBuf.length}, expected=${expectedLen}`);
    }
    return true;
  } catch (e) {
    console.error(`testStreamingWasmHash failed: ${e}`);
    return false;
  }
}

// Test Bun native SHA-256 hash
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

// Test CryptoJS SHA-256 hash
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

// Benchmark
async function benchmark() {
  const inputSmall = Buffer.from('Hello, Bun.js!');
  const input1MB = Buffer.alloc(1_000_000, 0x42); // 1MB
  const iterations = 10_000;
  const keyed = new Uint8Array(32).fill(0x42);
  const derive_key = 'context';


  // WASM BLAKE3
  console.time('SHA2 256 WASM (SHA2 256, small)');
  for (let i = 0; i < iterations; i++) {
    testSHA2WASMHash(inputSmall, 32, {});
  }
  console.timeEnd('SHA2 256 WASM (SHA2 256, small)');

  console.time('Blake3 Import (BLAKE3, small)');
  for (let i = 0; i < iterations; i++) {
    testBlake3ImportHash(inputSmall, 32, {});
  }
  console.timeEnd('Blake3 Import (BLAKE3, small)');

  console.time('Blake3 Single (BLAKE3, small)');
  for (let i = 0; i < iterations; i++) {
    testSingleWasmHash(inputSmall, 32, {});
  }
  console.timeEnd('Blake3 Single (BLAKE3, small)');

  console.time('WASM Keyed Hash (BLAKE3, small)');
  for (let i = 0; i < iterations; i++) {
    testSingleWasmHash(inputSmall, 32, { keyed });
  }
  console.timeEnd('WASM Keyed Hash (BLAKE3, small)');

  console.time('WASM Derive Key Hash (BLAKE3, small)');
  for (let i = 0; i < iterations; i++) {
    testSingleWasmHash(inputSmall, 32, { derive_key });
  }
  console.timeEnd('WASM Derive Key Hash (BLAKE3, small)');

  console.time('WASM Streaming Hash (BLAKE3, small)');
  for (let i = 0; i < iterations; i++) {
    testStreamingWasmHash(inputSmall, 32, {});
  }
  console.timeEnd('WASM Streaming Hash (BLAKE3, small)');

  console.time('WASM Streaming XOF (BLAKE3, small, 64 bytes)');
  for (let i = 0; i < iterations; i++) {
    testStreamingWasmHash(inputSmall, 64, { hash_length: 64 });
  }
  console.timeEnd('WASM Streaming XOF (BLAKE3, small, 64 bytes)');

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
}

// Run tests
async function runTest(): Promise<void> {
  const inputSmall = Buffer.from('Hello, Bun.js!');
  const keyed = new Uint8Array(32).fill(0x42);
  const derive_key = 'context';

  console.log('Testing WASM single hash (BLAKE3)...');
  if (!testSingleWasmHash(inputSmall, 32, {})) {
    console.error('Aborting due to WASM single hash failure');
    return;
  }

  console.log('Testing WASM keyed hash (BLAKE3)...');
  if (!testSingleWasmHash(inputSmall, 32, { keyed })) {
    console.error('Aborting due to WASM keyed hash failure');
    return;
  }

  console.log('Testing WASM derive_key hash (BLAKE3)...');
  if (!testSingleWasmHash(inputSmall, 32, { derive_key })) {
    console.error('Aborting due to WASM derive_key hash failure');
    return;
  }

  console.log('Testing WASM streaming hash (BLAKE3)...');
  if (!testStreamingWasmHash(inputSmall, 32, {})) {
    console.error('Aborting due to WASM streaming hash failure');
    return;
  }

  console.log('Testing WASM streaming XOF (BLAKE3)...');
  if (!testStreamingWasmHash(inputSmall, 64, { hash_length: 64 })) {
    console.error('Aborting due to WASM streaming XOF failure');
    return;
  }

  console.log('Testing Bun SHA-256 single hash...');
  if (!testSingleBunSha256(inputSmall, 32)) {
    console.error('Aborting due to Bun SHA-256 single hash failure');
    return;
  }

  console.log('Testing CryptoJS SHA-256 single hash...');
  if (!testCryptoJsSha256(inputSmall, 32)) {
    console.error('Aborting due to CryptoJS SHA-256 single hash failure');
    return;
  }

  console.log('Running benchmark...');
  await benchmark();
}

runTest().catch((e) => console.error('Test crashed:', e));