// import { dlopen, FFIType, ptr, suffix } from 'bun:ffi';
// import { existsSync } from 'fs';
// import * as blake3 from '../../packages/blake3_wasm/wasm';
// import { CryptoHasher } from 'bun';
// import SHA256 from 'crypto-js/sha256';

// // Đường dẫn tới native dylib
// const dylibPath = `/Users/wstran/Desktop/cryptographer/packages/blake3_wasm/native/libblake3_wasm.${suffix}`;

// // Kiểm tra file dylib
// if (!existsSync(dylibPath)) {
//   throw new Error(`File ${dylibPath} không tồn tại. Chạy './scripts/build.sh' để build.`);
// }

// // Load native FFI
// const { symbols: lib } = dlopen(dylibPath, {
//   hash: { args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr], returns: FFIType.u32 },
//   streaming_hasher_new: { args: [FFIType.ptr], returns: FFIType.ptr },
//   streaming_hasher_update: { args: [FFIType.ptr, FFIType.ptr, FFIType.u32], returns: FFIType.void },
//   streaming_hasher_finalize: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.u32 },
//   streaming_hasher_finalize_xof: { args: [FFIType.ptr, FFIType.u32, FFIType.ptr], returns: FFIType.u32 },
//   streaming_hasher_free: { args: [FFIType.ptr], returns: FFIType.void },
// });

// // Helper functions
// function stringToBuffer(str: string): Buffer {
//   return Buffer.from(str, 'binary');
// }

// function bufferToHex(buffer: Buffer): string {
//   return buffer.toString('hex');
// }

// function checkBufferAccess(buffer: Buffer, name: string): void {
//   try {
//     // @ts-ignore
//     buffer[0] = buffer[0];
//   } catch (e) {
//     throw new Error(`Cannot access ${name} buffer: ${e}`);
//   }
// }

// // Encode options cho native
// const HashOptions = {
//   size: 16,
//   encode(options: { keyed: Buffer | null; keyed_len: number; hash_length: number }): Buffer {
//     const buf = Buffer.alloc(this.size, 0);
//     let offset = 0;
//     buf.writeBigUInt64LE(options.keyed ? BigInt(ptr(options.keyed)) : 0n, offset); offset += 8;
//     buf.writeUInt32LE(options.keyed_len, offset); offset += 4;
//     buf.writeUInt32LE(options.hash_length, offset);
//     return buf;
//   },
// };

// // Test native BLAKE3 hash
// function testSingleNativeHash(input: string, expectedLen: number, options: { keyed: Buffer | null; keyed_len: number; hash_length: number }): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const optionsBuf = HashOptions.encode(options);
//     const outBuf = Buffer.alloc(Math.max(expectedLen, 128), 0);

//     checkBufferAccess(inputBuf, 'inputBuf');
//     checkBufferAccess(optionsBuf, 'optionsBuf');
//     checkBufferAccess(outBuf, 'outBuf');

//     const inputPtr = ptr(inputBuf);
//     const optionsPtr = ptr(optionsBuf);
//     const outPtr = ptr(outBuf);

//     if (!inputPtr || !optionsPtr || !outPtr) {
//       throw new Error(`Invalid pointer: inputPtr=${inputPtr}, optionsPtr=${optionsPtr}, outPtr=${outPtr}`);
//     }

//     Bun.gc(true);
    
//     const len = lib.hash(inputPtr, inputBuf.length, optionsPtr, outPtr);

//     // if (len !== expectedLen) {
//     //   console.log(len, inputPtr, inputBuf.length, optionsPtr, outPtr);
//     //   throw new Error(`Native hash failed: returned len=${len}, expected=${expectedLen}`);
//     // }

//     const output = bufferToHex(outBuf.slice(0, len));
//     return true;
//   } catch (e) {
//     console.error(`testSingleNativeHash failed: ${e}`);
//     return false;
//   }
// }

// // Test native BLAKE3 streaming hash
// function testStreamingNativeHash(input: string, expectedLen: number, options: { keyed: Buffer | null; keyed_len: number; hash_length: number }): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const optionsBuf = HashOptions.encode(options);
//     const outBuf = Buffer.alloc(Math.max(expectedLen, 128), 0);

//     checkBufferAccess(inputBuf, 'inputBuf');
//     checkBufferAccess(optionsBuf, 'optionsBuf');
//     checkBufferAccess(outBuf, 'outBuf');

//     Bun.gc(true);
//     const hasher = lib.streaming_hasher_new(ptr(optionsBuf));
//     if (!hasher) {
//       throw new Error('Failed to create streaming hasher');
//     }

//     lib.streaming_hasher_update(hasher, ptr(inputBuf), inputBuf.length);
//     const len = lib.streaming_hasher_finalize(hasher, ptr(outBuf));
//     lib.streaming_hasher_free(hasher);

//     if (len !== expectedLen) {
//       throw new Error(`Native streaming hash failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf.slice(0, len));
//     return true;
//   } catch (e) {
//     console.error(`testStreamingNativeHash failed: ${e}`);
//     return false;
//   }
// }

// // Test native BLAKE3 streaming XOF
// function testStreamingXofNativeHash(input: string, expectedLen: number, options: { keyed: Buffer | null; keyed_len: number; hash_length: number }): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const optionsBuf = HashOptions.encode(options);
//     const outBuf = Buffer.alloc(Math.max(expectedLen, 128), 0);

//     checkBufferAccess(inputBuf, 'inputBuf');
//     checkBufferAccess(optionsBuf, 'optionsBuf');
//     checkBufferAccess(outBuf, 'outBuf');

//     Bun.gc(true);
//     const hasher = lib.streaming_hasher_new(ptr(optionsBuf));
//     if (!hasher) {
//       throw new Error('Failed to create streaming hasher');
//     }

//     lib.streaming_hasher_update(hasher, ptr(inputBuf), inputBuf.length);
//     const len = lib.streaming_hasher_finalize_xof(hasher, expectedLen, ptr(outBuf));
//     lib.streaming_hasher_free(hasher);

//     if (len !== expectedLen) {
//       throw new Error(`Native streaming XOF failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf.slice(0, len));
//     return true;
//   } catch (e) {
//     console.error(`testStreamingXofNativeHash failed: ${e}`);
//     return false;
//   }
// }

// // Test WASM BLAKE3 hash
// function testSingleWasmHash(input: string, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const outBuf = blake3.hash(inputBuf, options);
//     const len = outBuf.length;

//     if (len !== expectedLen) {
//       throw new Error(`WASM hash failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf as Buffer<ArrayBuffer>);
//     return true;
//   } catch (e) {
//     console.error(`testSingleWasmHash failed: ${e}`);
//     return false;
//   }
// }

// // Test WASM BLAKE3 streaming hash
// function testStreamingWasmHash(input: string, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const hasher = new blake3.StreamingHasher(options);
//     hasher.update(inputBuf);
//     const outBuf = hasher.finalize();
//     const len = outBuf.length;

//     if (len !== expectedLen) {
//       throw new Error(`WASM streaming hash failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf as Buffer<ArrayBuffer>);
//     return true;
//   } catch (e) {
//     console.error(`testStreamingWasmHash failed: ${e}`);
//     return false;
//   }
// }

// // Test WASM BLAKE3 streaming XOF
// function testStreamingXofWasmHash(input: string, expectedLen: number, options: { keyed?: Uint8Array; derive_key?: string; hash_length?: number }): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const hasher = new blake3.StreamingHasher(options);
//     hasher.update(inputBuf);
//     const outBuf = hasher.finalize_xof(expectedLen);
//     const len = outBuf.length;

//     if (len !== expectedLen) {
//       throw new Error(`WASM streaming XOF failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf as Buffer<ArrayBuffer>);
//     return true;
//   } catch (e) {
//     console.error(`testStreamingXofWasmHash failed: ${e}`);
//     return false;
//   }
// }

// // Test Bun native SHA-256 hash
// function testSingleBunSha256(input: string, expectedLen: number): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const hasher = new CryptoHasher('sha256');
//     hasher.update(inputBuf);
//     const outBuf = hasher.digest();
//     const len = outBuf.length;

//     if (len !== expectedLen) {
//       throw new Error(`Bun SHA-256 hash failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf);
//     return true;
//   } catch (e) {
//     console.error(`testSingleBunSha256 failed: ${e}`);
//     return false;
//   }
// }

// // Test Bun native SHA-256 streaming hash
// function testStreamingBunSha256(input: string, expectedLen: number): boolean {
//   try {
//     const inputBuf = stringToBuffer(input);
//     const hasher = new CryptoHasher('sha256');
//     hasher.update(inputBuf);
//     const outBuf = hasher.digest();
//     const len = outBuf.length;

//     if (len !== expectedLen) {
//       throw new Error(`Bun SHA-256 streaming hash failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf);
//     return true;
//   } catch (e) {
//     console.error(`testStreamingBunSha256 failed: ${e}`);
//     return false;
//   }
// }

// // Test CryptoJS SHA-256 hash
// function testCryptoJsSha256(input: string, expectedLen: number): boolean {
//   try {
//     const hash = SHA256(input).toString();
//     const outBuf = Buffer.from(hash, 'hex');
//     const len = outBuf.length;

//     if (len !== expectedLen) {
//       throw new Error(`CryptoJS SHA-256 hash failed: returned len=${len}, expected=${expectedLen}`);
//     }

//     const output = bufferToHex(outBuf);
//     return true;
//   } catch (e) {
//     console.error(`testCryptoJsSha256 failed: ${e}`);
//     return false;
//   }
// }

// // Benchmark
// async function benchmark() {
//   const input1MB = Buffer.alloc(1_000_000, 0x42); // 1MB input
//   const iterations = 1_000;
//   const keyed = Buffer.from(new Uint8Array(32).fill(0x42));
//   const derive_key = 'context';

//  // Bun native SHA-256 benchmark
//   console.time('Bun SHA-256 Single Hash');
//   for (let i = 0; i < iterations; i++) {
//     testSingleBunSha256('Hello, Bun.js!', 32);
//   }
//   console.timeEnd('Bun SHA-256 Single Hash');

//   console.time('Bun SHA-256 Single Hash (1MB)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleBunSha256(input1MB.toString('binary'), 32);
//   }
//   console.timeEnd('Bun SHA-256 Single Hash (1MB)');

//   console.time('Bun SHA-256 Streaming Hash');
//   for (let i = 0; i < iterations; i++) {
//     testStreamingBunSha256('Hello, Bun.js!', 32);
//   }
//   console.timeEnd('Bun SHA-256 Streaming Hash');

//   // Native BLAKE3 benchmark
//   console.time('Native Single Hash (BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleNativeHash('Hello, Bun.js!', 32, { keyed: null, keyed_len: 0, hash_length: 32 });
//   }
//   console.timeEnd('Native Single Hash (BLAKE3)');

//   console.time('Native Single Hash (1MB, BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleNativeHash(input1MB.toString('binary'), 32, { keyed: null, keyed_len: 0, hash_length: 32 });
//   }
//   console.timeEnd('Native Single Hash (1MB, BLAKE3)');

//   console.time('Native Single Hash (Keyed, BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleNativeHash('Hello, Bun.js!', 32, { keyed, keyed_len: 32, hash_length: 32 });
//   }
//   console.timeEnd('Native Single Hash (Keyed, BLAKE3)');

//   console.time('Native Single Hash (Derive Key, BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleNativeHash('Hello, Bun.js!', 32, { keyed: null, keyed_len: 0, hash_length: 32 });
//   }
//   console.timeEnd('Native Single Hash (Derive Key, BLAKE3)');

//   console.time('Native Streaming Hash (BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testStreamingNativeHash('Hello, Bun.js!', 32, { keyed: null, keyed_len: 0, hash_length: 32 });
//   }
//   console.timeEnd('Native Streaming Hash (BLAKE3)');

//   console.time('Native Streaming XOF (BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testStreamingXofNativeHash('Hello, Bun.js!', 64, { keyed: null, keyed_len: 0, hash_length: 64 });
//   }
//   console.timeEnd('Native Streaming XOF (BLAKE3)');

//   // WASM BLAKE3 benchmark
//   console.time('WASM Single Hash (BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleWasmHash('Hello, Bun.js!', 32, {});
//   }
//   console.timeEnd('WASM Single Hash (BLAKE3)');

//   console.time('WASM Single Hash (1MB, BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleWasmHash(input1MB.toString('binary'), 32, {});
//   }
//   console.timeEnd('WASM Single Hash (1MB, BLAKE3)');

//   console.time('WASM Single Hash (Keyed, BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleWasmHash('Hello, Bun.js!', 32, { keyed: new Uint8Array(keyed) });
//   }
//   console.timeEnd('WASM Single Hash (Keyed, BLAKE3)');

//   console.time('WASM Single Hash (Derive Key, BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testSingleWasmHash('Hello, Bun.js!', 32, { derive_key });
//   }
//   console.timeEnd('WASM Single Hash (Derive Key, BLAKE3)');

//   console.time('WASM Streaming Hash (BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testStreamingWasmHash('Hello, Bun.js!', 32, {});
//   }
//   console.timeEnd('WASM Streaming Hash (BLAKE3)');

//   console.time('WASM Streaming XOF (BLAKE3)');
//   for (let i = 0; i < iterations; i++) {
//     testStreamingXofWasmHash('Hello, Bun.js!', 64, { hash_length: 64 });
//   }
//   console.timeEnd('WASM Streaming XOF (BLAKE3)');

//   // CryptoJS SHA-256 benchmark
//   console.time('CryptoJS SHA-256 Single Hash');
//   for (let i = 0; i < iterations; i++) {
//     testCryptoJsSha256('Hello, Bun.js!', 32);
//   }
//   console.timeEnd('CryptoJS SHA-256 Single Hash');

//   console.time('CryptoJS SHA-256 Single Hash (1MB)');
//   for (let i = 0; i < iterations; i++) {
//     testCryptoJsSha256(input1MB.toString('binary'), 32);
//   }
//   console.timeEnd('CryptoJS SHA-256 Single Hash (1MB)');
// }

// // Run tests
// async function runTest(): Promise<void> {
//   const input = 'Hello, Bun.js!';
//   const keyed = Buffer.from(new Uint8Array(32).fill(0x42));
//   const derive_key = 'context';

//   console.log('Testing single native hash (BLAKE3)...');
//   if (!testSingleNativeHash(input, 32, { keyed: null, keyed_len: 0, hash_length: 32 })) {
//     console.error('Aborting due to single native hash (BLAKE3) failure');
//     return;
//   }

//   console.log('Testing single native hash (keyed, BLAKE3)...');
//   if (!testSingleNativeHash(input, 32, { keyed, keyed_len: 32, hash_length: 32 })) {
//     console.error('Aborting due to single native hash (keyed, BLAKE3) failure');
//     return;
//   }

//   console.log('Testing single native hash (derive_key, BLAKE3)...');
//   if (!testSingleNativeHash(input, 32, { keyed: null, keyed_len: 0, hash_length: 32 })) {
//     console.error('Aborting due to single native hash (derive_key, BLAKE3) failure');
//     return;
//   }

//   console.log('Testing streaming native hash (BLAKE3)...');
//   if (!testStreamingNativeHash(input, 32, { keyed: null, keyed_len: 0, hash_length: 32 })) {
//     console.error('Aborting due to streaming native hash (BLAKE3) failure');
//     return;
//   }

//   console.log('Testing streaming XOF native hash (BLAKE3)...');
//   if (!testStreamingXofNativeHash(input, 64, { keyed: null, keyed_len: 0, hash_length: 64 })) {
//     console.error('Aborting due to streaming XOF native hash (BLAKE3) failure');
//     return;
//   }

//   console.log('Testing single WASM hash (BLAKE3)...');
//   if (!testSingleWasmHash(input, 32, {})) {
//     console.error('Aborting due to single WASM hash (BLAKE3) failure');
//     return;
//   }

//   console.log('Testing single WASM hash (keyed, BLAKE3)...');
//   if (!testSingleWasmHash(input, 32, { keyed: new Uint8Array(keyed) })) {
//     console.error('Aborting due to single WASM hash (keyed, BLAKE3) failure');
//     return;
//   }

//   console.log('Testing single WASM hash (derive_key, BLAKE3)...');
//   if (!testSingleWasmHash(input, 32, { derive_key })) {
//     console.error('Aborting due to single WASM hash (derive_key, BLAKE3) failure');
//     return;
//   }

//   console.log('Testing streaming WASM hash (BLAKE3)...');
//   if (!testStreamingWasmHash(input, 32, {})) {
//     console.error('Aborting due to streaming WASM hash (BLAKE3) failure');
//     return;
//   }

//   console.log('Testing streaming XOF WASM hash (BLAKE3)...');
//   if (!testStreamingXofWasmHash(input, 64, { hash_length: 64 })) {
//     console.error('Aborting due to streaming XOF WASM hash (BLAKE3) failure');
//     return;
//   }

//   console.log('Testing Bun SHA-256 single hash...');
//   if (!testSingleBunSha256(input, 32)) {
//     console.error('Aborting due to Bun SHA-256 single hash failure');
//     return;
//   }

//   console.log('Testing Bun SHA-256 streaming hash...');
//   if (!testStreamingBunSha256(input, 32)) {
//     console.error('Aborting due to Bun SHA-256 streaming hash failure');
//     return;
//   }

//   console.log('Testing CryptoJS SHA-256 single hash...');
//   if (!testCryptoJsSha256(input, 32)) {
//     console.error('Aborting due to CryptoJS SHA-256 single hash failure');
//     return;
//   }

//   console.log('Running benchmark...');
//   await benchmark();
// }

// runTest().catch((e) => console.error('Test crashed:', e));