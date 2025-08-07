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

async function main() {
  await testHashes();
  await testHmac();
  await testAES();
  await testKdf();
  console.log('All tests passed');
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});


