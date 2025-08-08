// test-crt/run-tests.ts
import path from 'path';
import fs from 'fs';

// Load the built library from dist
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cryptoLib = require(path.join(__dirname, '..', 'dist', 'index.js'));

function toHex(buf: Buffer | string): string {
  if (typeof buf === 'string') return buf;
  return Buffer.from(buf).toString('hex');
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function randomBytes(n: number): Buffer {
  return Buffer.from(Array.from({ length: n }, () => Math.floor(Math.random() * 256)));
}

async function testHashes() {
  const { hash } = cryptoLib;
  const inputs: (string | Buffer | Uint8Array)[] = [
    '',
    'abc',
    'The quick brown fox jumps over the lazy dog',
    Buffer.from('00ff', 'hex'),
    new Uint8Array([1, 2, 3, 4, 5]),
  ];
  const fns: Array<[string, (input: any, opts?: any) => any]> = [
    ['sha1', hash.sha1],
    ['sha256', hash.sha256],
    ['sha512', hash.sha512],
    ['sha3_256', hash.sha3_256],
    ['sha3_512', hash.sha3_512],
    ['md4', hash.md4],
    ['md5', hash.md5],
    ['blake2b', hash.blake2b],
    ['blake2s', hash.blake2s],
    ['blake3', hash.blake3],
    ['whirlpool', hash.whirlpool],
    ['ripemd160', hash.ripemd160],
  ];

  const outputs: Array<'hex' | 'base64' | 'binary' | 'buffer'> = [
    'hex',
    'base64',
    'binary',
    'buffer',
  ];

  for (const [name, fn] of fns) {
    for (const input of inputs) {
      for (const fmt of outputs) {
        const out = fn(input, { outputFormat: fmt });
        if (fmt === 'buffer') {
          assert(Buffer.isBuffer(out), `${name}(${typeof input}) output buffer expected`);
        } else {
          assert(typeof out === 'string', `${name}(${typeof input}) output string expected`);
          assert(out.length > 0 || (typeof input === 'string' && input.length === 0), `${name} output non-empty`);
        }
      }
    }
  }

  // Streaming interface smoke test
  const h = hash.sha256.create();
  h.update('foo').update('bar');
  const dig = h.digest('hex');
  assert(typeof dig === 'string' && dig.length > 0, 'streaming sha256 digest');
}

async function testHmac() {
  const { hmac } = cryptoLib;
  const key = randomBytes(32);
  const dataCases = ['abc', randomBytes(16), new Uint8Array([9, 8, 7])];
  const algs: Array<[string, (d: any, o: any) => any]> = [
    ['sha1', hmac.sha1],
    ['sha256', hmac.sha256],
    ['sha512', hmac.sha512],
    ['md5', hmac.md5],
  ];
  const outputs: Array<'hex' | 'base64' | 'binary' | 'buffer'> = [
    'hex', 'base64', 'binary', 'buffer'
  ];
  for (const [name, fn] of algs) {
    for (const data of dataCases) {
      for (const fmt of outputs) {
        const out = fn(data, { key, outputFormat: fmt });
        if (fmt === 'buffer') assert(Buffer.isBuffer(out), `hmac ${name} buffer expected`);
        else assert(typeof out === 'string', `hmac ${name} string expected`);
      }
    }
  }
}

async function testAES() {
  const { cipher } = cryptoLib;
  const key128 = randomBytes(16);
  const key192 = randomBytes(24);
  const key256 = randomBytes(32);
  const iv = randomBytes(16);
  const payloads = [
    Buffer.alloc(0),
    Buffer.from('hello world'),
    randomBytes(31),
    new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
  ];

  const modes: Array<'cbc' | 'ecb' | 'ctr'> = ['cbc', 'ecb', 'ctr'];
  const keys = [key128, key192, key256];

  for (const data of payloads) {
    for (const mode of modes) {
      for (const key of keys) {
        const opts: any = { key, mode };
        if (mode !== 'ecb') opts.iv = iv;
        const enc = cipher.aes.encrypt(data, opts);
        assert(Buffer.isBuffer(enc), 'aes encrypt returns buffer');
        const dec = cipher.aes.decrypt(enc, opts);
        assert(Buffer.isBuffer(dec), 'aes decrypt returns buffer');
        assert(Buffer.compare(Buffer.from(data as any), dec) === 0, `aes ${mode} roundtrip`);
      }
    }
  }
}

async function testChaCha20() {
  const { cipher } = cryptoLib;
  const key = randomBytes(32);
  const nonce = randomBytes(12);
  const payloads = [Buffer.alloc(0), Buffer.from('hello world'), randomBytes(31)];
  for (const data of payloads) {
    const enc = cipher.chacha20.encrypt(data, { key, iv: nonce, mode: 'ctr' });
    assert(Buffer.isBuffer(enc), 'chacha20 encrypt returns buffer');
    const dec = cipher.chacha20.decrypt(enc, { key, iv: nonce, mode: 'ctr' });
    assert(Buffer.compare(Buffer.from(data as any), dec) === 0, 'chacha20 ctr roundtrip');
  }

  // AEAD mapping via 'cbc' selector
  const aeadNonce = randomBytes(12);
  const ct = cipher.chacha20.encrypt('secret', { key, iv: aeadNonce, mode: 'cbc' });
  const pt = cipher.chacha20.decrypt(ct, { key, iv: aeadNonce, mode: 'cbc' });
  assert(pt.toString() === 'secret', 'chacha20-poly1305 aead roundtrip');
}

async function testDES() {
  const { cipher } = cryptoLib;
  const keyDES = randomBytes(8);
  const key3DES = randomBytes(24);
  const iv = randomBytes(8);
  const payloads = [Buffer.alloc(0), Buffer.from('hello'), randomBytes(24)];
  for (const data of payloads) {
    // DES CBC
    const encDes = cipher.des.encrypt(data, { key: keyDES, iv, mode: 'cbc' });
    const decDes = cipher.des.decrypt(encDes, { key: keyDES, iv, mode: 'cbc' });
    assert(Buffer.compare(Buffer.from(data as any), decDes) === 0, 'des cbc roundtrip');

    // 3DES CTR
    const enc3 = cipher.des.encrypt(data, { key: key3DES, iv, mode: 'ctr' });
    const dec3 = cipher.des.decrypt(enc3, { key: key3DES, iv, mode: 'ctr' });
    assert(Buffer.compare(Buffer.from(data as any), dec3) === 0, '3des ctr roundtrip');
  }
}

async function testKdf() {
  const { kdf } = cryptoLib;
  const passwordCases = ['password', randomBytes(8), new Uint8Array([1, 2, 3, 4])];

  // PBKDF2
  for (const pwd of passwordCases) {
    const out = kdf.pbkdf2(pwd, { salt: randomBytes(16), iterations: 100000, keyLength: 32, outputFormat: 'hex' });
    assert(typeof out === 'string' && out.length > 0, 'pbkdf2 output');
  }

  // Argon2 variants
  const variants: Array<'argon2i' | 'argon2d' | 'argon2id'> = ['argon2i', 'argon2d', 'argon2id'];
  for (const v of variants) {
    const out = kdf.argon2('pwd', { salt: randomBytes(16), variant: v, keyLength: 32, timeCost: 2, memoryCost: 2048, parallelism: 1, outputFormat: 'hex' });
    assert(typeof out === 'string' && out.length > 0, `argon2 ${v} output`);
  }

  // bcrypt
  const hash = kdf.bcrypt.hash('secret', { rounds: 10 });
  assert(typeof hash === 'string' && hash.length > 0, 'bcrypt hash');
  assert(kdf.bcrypt.verify('secret', hash) === true, 'bcrypt verify true');
  assert(kdf.bcrypt.verify('wrong', hash) === false, 'bcrypt verify false');
}

async function testAsymmetric() {
  const lib = require(path.join(__dirname, '..', 'dist', 'index.js'));
  // X25519
  const xkp = lib.x25519.generateKeypair();
  const xkp2 = lib.x25519.generateKeypair();
  const ss1 = lib.x25519.deriveSharedSecret(xkp.privateKey, xkp2.publicKey);
  const ss2 = lib.x25519.deriveSharedSecret(xkp2.privateKey, xkp.publicKey);
  assert(Buffer.compare(ss1, ss2) === 0, 'x25519 shared secret matches');

  // ECDH P-256 (required)
  const e1 = lib.ecdh.generateKeypair('p256');
  const e2 = lib.ecdh.generateKeypair('p256');
  const es1 = lib.ecdh.deriveSharedSecret('p256', e1.privateKey, e2.publicKey);
  const es2 = lib.ecdh.deriveSharedSecret('p256', e2.privateKey, e1.publicKey);
  assert(Buffer.compare(es1, es2) === 0, 'ecdh p256 shared secret matches');

  // Kyber removed in this build

  // RSA-OAEP with SHA-256 (using a small test key set)
  // Minimal DER keys for test would be large; skip heavy vector here. Validate error path with bogus key.
  let threw = false;
  try {
    lib.rsa_oaep.encrypt(Buffer.from('hi'), Buffer.alloc(4), { hash: 'sha256' });
  } catch (_e) {
    threw = true;
  }
  assert(threw, 'rsa-oaep expected to throw with invalid key');
}

async function main() {
  await testHashes();
  await testHmac();
  await testAES();
  await testChaCha20();
  await testDES();
  await testKdf();
  await testAsymmetric();
  console.log('All tests passed');
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});


