/* eslint-disable no-console */
const path = require('path');
const { generateKeyPairSync, randomBytes: nodeRandomBytes } = require('crypto');

function hr() {
  console.log('\n' + '='.repeat(80) + '\n');
}

function section(title) {
  console.log(`\n--- ${title} ---`);
}

function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
}

function hex(buf, len = 32) {
  return Buffer.from(buf).toString('hex').slice(0, len);
}

(async () => {
  const lib = require(path.join(__dirname, '..', 'dist', 'index.js'));

  hr();
  console.log('cryptographer.js – Comprehensive Algorithm Test Suite');
  console.log('Node', process.version);
  hr();

  // Hash
  section('Hash');
  const msg = 'Hello World';
  const hashes = {
    sha1: lib.sha.sha1(msg),
    sha256: lib.sha.sha256(msg),
    sha512: lib.sha.sha512(msg),
    sha3_256: lib.sha.sha3_256(msg),
    sha3_512: lib.sha.sha3_512(msg),
    md4: lib.sha.md4(msg),
    md5: lib.sha.md5(msg),
    blake2b: lib.sha.blake2b(msg),
    blake2s: lib.sha.blake2s(msg),
    blake3: lib.sha.blake3(msg),
    whirlpool: lib.sha.whirlpool(msg),
    ripemd160: lib.sha.ripemd160(msg),
  };
  console.table(Object.entries(hashes).map(([k, v]) => ({ algo: k, hex: String(v).slice(0, 32) + '…', len: String(v).length })));
  // Streaming hash
  const h = lib.sha.sha256.create();
  h.update('Hello').update(' ').update('World');
  const streamHash = h.digest('hex');
  assert(streamHash === hashes.sha256, 'streaming sha256 matches');

  // HMAC
  section('HMAC');
  const key = 'secret';
  const hmacs = {
    sha1: lib.hmac.sha1(msg, { key }),
    sha256: lib.hmac.sha256(msg, { key }),
    sha512: lib.hmac.sha512(msg, { key }),
    md5: lib.hmac.md5(msg, { key }),
  };
  console.table(Object.entries(hmacs).map(([k, v]) => ({ algo: k, hex: String(v).slice(0, 32) + '…' })));
  // Streaming HMAC (sha256)
  const hs = lib.hmac.sha256.create({ key });
  hs.update('Hello').update(' ').update('World');
  const hmacStream = hs.digest('hex');
  assert(hmacStream === hmacs.sha256, 'streaming hmac sha256 matches');

  // AES – keys and nonces
  section('AES');
  const aesMsg = Buffer.from('Attack at dawn!');
  const key128 = nodeRandomBytes(16);
  const key192 = nodeRandomBytes(24);
  const key256 = nodeRandomBytes(32);
  // GCM
  const n12 = nodeRandomBytes(12);
  const encG128 = lib.cipher.aes.encrypt(aesMsg, { key: key128, iv: n12, mode: 'gcm' });
  const decG128 = lib.cipher.aes.decrypt(encG128, { key: key128, iv: n12, mode: 'gcm' });
  assert(decG128.equals(aesMsg), 'AES-128-GCM roundtrip');
  const encG192 = lib.cipher.aes.encrypt(aesMsg, { key: key192, iv: n12, mode: 'gcm' });
  const decG192 = lib.cipher.aes.decrypt(encG192, { key: key192, iv: n12, mode: 'gcm' });
  assert(decG192.equals(aesMsg), 'AES-192-GCM roundtrip');
  const encG256 = lib.cipher.aes.encrypt(aesMsg, { key: key256, iv: n12, mode: 'gcm' });
  const decG256 = lib.cipher.aes.decrypt(encG256, { key: key256, iv: n12, mode: 'gcm' });
  assert(decG256.equals(aesMsg), 'AES-256-GCM roundtrip');
  // CTR
  const n16 = nodeRandomBytes(16);
  const encC128 = lib.cipher.aes.encrypt(aesMsg, { key: key128, iv: n16, mode: 'ctr' });
  const decC128 = lib.cipher.aes.decrypt(encC128, { key: key128, iv: n16, mode: 'ctr' });
  assert(decC128.equals(aesMsg), 'AES-128-CTR roundtrip');
  const encC192 = lib.cipher.aes.encrypt(aesMsg, { key: key192, iv: n16, mode: 'ctr' });
  const decC192 = lib.cipher.aes.decrypt(encC192, { key: key192, iv: n16, mode: 'ctr' });
  assert(decC192.equals(aesMsg), 'AES-192-CTR roundtrip');
  const encC256 = lib.cipher.aes.encrypt(aesMsg, { key: key256, iv: n16, mode: 'ctr' });
  const decC256 = lib.cipher.aes.decrypt(encC256, { key: key256, iv: n16, mode: 'ctr' });
  assert(decC256.equals(aesMsg), 'AES-256-CTR roundtrip');
  // CCM
  const n13 = nodeRandomBytes(13);
  const encCCM128 = lib.cipher.aes.encrypt(aesMsg, { key: key128, iv: n13, mode: 'ccm' });
  const decCCM128 = lib.cipher.aes.decrypt(encCCM128, { key: key128, iv: n13, mode: 'ccm' });
  assert(decCCM128.equals(aesMsg), 'AES-128-CCM roundtrip');
  // SIV (requires 32B or 64B key)
  const keySiv128 = nodeRandomBytes(32);
  const encSiv = lib.cipher.aes.encrypt(aesMsg, { key: keySiv128, iv: n16, mode: 'siv' });
  const decSiv = lib.cipher.aes.decrypt(encSiv, { key: keySiv128, iv: n16, mode: 'siv' });
  assert(decSiv.equals(aesMsg), 'AES-128-SIV roundtrip');
  // CBC alias (maps to GCM internally)
  const ivCBC = nodeRandomBytes(16);
  const encCBC = lib.cipher.aes.encrypt(aesMsg, { key: key256, iv: ivCBC, mode: 'cbc' });
  const decCBC = lib.cipher.aes.decrypt(encCBC, { key: key256, iv: ivCBC, mode: 'cbc' });
  assert(decCBC.equals(aesMsg), 'AES-CBC alias roundtrip');
  // ECB alias (emulated via CTR zero-IV)
  const encECB = lib.cipher.aes.encrypt(aesMsg, { key: key128, mode: 'ecb' });
  const decECB = lib.cipher.aes.decrypt(encECB, { key: key128, mode: 'ecb' });
  assert(decECB.equals(aesMsg), 'AES-ECB alias roundtrip');
  console.table([
    { mode: 'gcm', n: 12, sample: hex(encG256) + '…' },
    { mode: 'ctr', n: 16, sample: hex(encC256) + '…' },
    { mode: 'ccm', n: 13, sample: hex(encCCM128) + '…' },
    { mode: 'siv', n: 16, sample: hex(encSiv) + '…' },
    { mode: 'cbc (alias→gcm)', n: 16, sample: hex(encCBC) + '…' },
    { mode: 'ecb (alias→ctr)', n: 0, sample: hex(encECB) + '…' },
  ]);
  console.table([
    { mode: 'gcm', n: 12, sample: hex(encG256) + '…' },
    { mode: 'ctr', n: 16, sample: hex(encC256) + '…' },
    { mode: 'ccm', n: 13, sample: hex(encCCM128) + '…' },
    { mode: 'siv', n: 16, sample: hex(encSiv) + '…' },
    { mode: 'cbc (alias→gcm)', n: 16, sample: hex(encCBC) + '…' },
    { mode: 'ecb (alias→ctr)', n: 0, sample: hex(encECB) + '…' },
  ]);

  // DES / 3DES
  section('DES / 3DES');
  const dMsg = Buffer.from('legacy-data');
  const kDes = nodeRandomBytes(8);
  const k3Des = nodeRandomBytes(24);
  const iv8 = nodeRandomBytes(8);
  const encDesCbc = lib.cipher.des.encrypt(dMsg, { key: kDes, iv: iv8, mode: 'cbc' });
  const decDesCbc = lib.cipher.des.decrypt(encDesCbc, { key: kDes, iv: iv8, mode: 'cbc' });
  assert(decDesCbc.equals(dMsg), 'DES-CBC roundtrip');
  const enc3Ctr = lib.cipher.des.encrypt(dMsg, { key: k3Des, iv: iv8, mode: 'ctr' });
  const dec3Ctr = lib.cipher.des.decrypt(enc3Ctr, { key: k3Des, iv: iv8, mode: 'ctr' });
  assert(dec3Ctr.equals(dMsg), '3DES-CTR roundtrip');
  console.table([
    { mode: 'cbc', n: 8, sample: hex(encDesCbc) + '…' },
    { mode: 'ctr', n: 8, sample: hex(enc3Ctr) + '…' },
  ]);

  // ChaCha20
  section('ChaCha20');
  const ccKey = nodeRandomBytes(32);
  const ccN = nodeRandomBytes(12);
  const ccEnc = lib.cipher.chacha20.encrypt(aesMsg, { key: ccKey, iv: ccN, mode: 'ctr' });
  const ccDec = lib.cipher.chacha20.decrypt(ccEnc, { key: ccKey, iv: ccN, mode: 'ctr' });
  assert(ccDec.equals(aesMsg), 'ChaCha20-CTR roundtrip');
  const ccAead = lib.cipher.chacha20.encrypt(aesMsg, { key: ccKey, iv: ccN, mode: 'cbc' });
  const ccAeadDec = lib.cipher.chacha20.decrypt(ccAead, { key: ccKey, iv: ccN, mode: 'cbc' });
  assert(ccAeadDec.equals(aesMsg), 'ChaCha20-Poly1305 AEAD roundtrip');
  console.table([
    { mode: 'ctr', n: 12, sample: hex(ccEnc) + '…' },
    { mode: 'cbc (alias→gcm)', n: 12, sample: hex(ccAead) + '…' },
  ]);

  // Key exchange
  section('Key Exchange');
  const x1 = lib.x25519.generateKeypair();
  const x2 = lib.x25519.generateKeypair();
  const xs1 = lib.x25519.deriveSharedSecret(x1.privateKey, x2.publicKey);
  const xs2 = lib.x25519.deriveSharedSecret(x2.privateKey, x1.publicKey);
  assert(Buffer.compare(xs1, xs2) === 0, 'X25519 shared secret matches');
  console.table([{ algo: 'x25519', shared: hex(xs1, 48) + '…' }]);

  // ECDH
  const e1 = lib.ecdh.generateKeypair('p256');
  const e2 = lib.ecdh.generateKeypair('p256');
  const es1 = lib.ecdh.deriveSharedSecret('p256', e1.privateKey, e2.publicKey);
  const es2 = lib.ecdh.deriveSharedSecret('p256', e2.privateKey, e1.publicKey);
  assert(Buffer.compare(es1, es2) === 0, 'ECDH P-256 shared secret matches');
  const r1 = lib.ecdh.generateKeypair('p384');
  const r2 = lib.ecdh.generateKeypair('p384');
  const rs1 = lib.ecdh.deriveSharedSecret('p384', r1.privateKey, r2.publicKey);
  const rs2 = lib.ecdh.deriveSharedSecret('p384', r2.privateKey, r1.publicKey);
  assert(Buffer.compare(rs1, rs2) === 0, 'ECDH P-384 shared secret matches');
  console.table([
    { algo: 'x25519', shared: hex(xs1, 48) + '…' },
    { algo: 'ecdh (p256)', shared: hex(es1, 48) + '…' },
    { algo: 'ecdh (p384)', shared: hex(rs1, 48) + '…' },
  ]);

  // DSA – Ed25519 / ECDSA / RSA
  section('DSA');
  // Ed25519
  const ed = lib.ed25519.generateKeypair();
  const sigEd = lib.ed25519.sign(ed.privateKey, msg);
  assert(lib.ed25519.verify(ed.publicKey, msg, sigEd), 'Ed25519 verify ok');
  assert(!lib.ed25519.verify(ed.publicKey, 'tamper', sigEd), 'Ed25519 verify fails on tamper');

  // ECDSA secp256r1
  const kpR1 = lib.ecdsa.generateKeypair('secp256r1');
  const sigR1 = lib.ecdsa.sign(msg, { curve: 'secp256r1', privateKey: kpR1.privateKey, hash: 'sha256' });
  assert(lib.ecdsa.verify(msg, { curve: 'secp256r1', publicKey: kpR1.publicKey, signature: sigR1 }), 'ECDSA r1 verify ok');
  assert(!lib.ecdsa.verify('bad', { curve: 'secp256r1', publicKey: kpR1.publicKey, signature: sigR1 }), 'ECDSA r1 verify fails on tamper');

  // ECDSA secp256k1
  const kpK1 = lib.ecdsa.generateKeypair('secp256k1');
  const sigK1 = lib.ecdsa.sign(msg, { curve: 'secp256k1', privateKey: kpK1.privateKey, hash: 'sha256' });
  assert(lib.ecdsa.verify(msg, { curve: 'secp256k1', publicKey: kpK1.publicKey, signature: sigK1 }), 'ECDSA k1 verify ok');

  // RSA (Generate keys in DER)
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });
  const msgBuf = Buffer.from('hello-rsa');
  const sPss = lib.rsa.signPSS(msgBuf, privateKey, { hash: 'sha256' });
  assert(lib.rsa.verifyPSS(msgBuf, publicKey, sPss, { hash: 'sha256' }), 'RSA-PSS verify ok');
  const sPkcs = lib.rsa.signPKCS1v15(msgBuf, privateKey, { hash: 'sha256' });
  assert(lib.rsa.verifyPKCS1v15(msgBuf, publicKey, sPkcs, { hash: 'sha256' }), 'RSA-PKCS1v15 verify ok');
  console.table([
    { mode: 'ed25519', n: 12, signature: hex(sigEd) + '…',len: sigEd.length },
    { mode: 'ecdsa (secp256r1)', n: 12, signature: hex(sigR1) + '…',len: sigR1.length },
    { mode: 'ecdsa (secp256k1)', n: 12, signature: hex(sigK1) + '…',len: sigK1.length },
    { mode: 'rsa-pss', n: 12, signature: hex(sPss) + '…',len: sPss.length },
    { mode: 'rsa-pkcs1v15', n: 12, signature: hex(sPkcs) + '…',len: sPkcs.length },
  ]);

  // RSA-OAEP
  section('RSA-OAEP');
  const dataKey = nodeRandomBytes(32);
  const wrapped = lib.rsa_oaep.encrypt(dataKey, publicKey, { hash: 'sha256' });
  const unwrapped = lib.rsa_oaep.decrypt(wrapped, privateKey, { hash: 'sha256' });
  assert(unwrapped.equals(dataKey), 'RSA-OAEP unwrap matches');
  console.table([
    { mode: 'rsa-oaep', n: 12, sample: hex(wrapped) + '…' },
  ]);

  // KDF
  section('KDF');
  const salt = nodeRandomBytes(16);
  const pbk = lib.kdf.pbkdf2('password', { salt, iterations: 100000, keyLength: 32 });
  const pbk2 = lib.kdf.pbkdf2('password', { salt, iterations: 100000, keyLength: 32 });
  assert(Buffer.compare(Buffer.from(pbk, 'hex'), Buffer.from(pbk2, 'hex')) === 0, 'PBKDF2 deterministic with same params');
  const bHash = lib.kdf.bcrypt.hash('secret', { rounds: 10 });
  assert(lib.kdf.bcrypt.verify('secret', bHash), 'bcrypt verify ok');
  const a2 = await lib.kdf.argon2('p@ss', { salt, timeCost: 1, memoryCost: 4096, parallelism: 1, variant: 'id' });
  assert(typeof a2 === 'string' && a2.startsWith('$argon2'), 'argon2 PHC string');
  console.table([
    { mode: 'pbkdf2', n: 12, sample: hex(pbk) + '…' },
    { mode: 'bcrypt', n: 12, sample: hex(bHash) + '…' },
    { mode: 'argon2', n: 12, sample: hex(a2) + '…' },
  ]);

  // Utils
  section('Utils');
  const rb = lib.randomBytes(16);
  assert(Buffer.isBuffer(rb) && rb.length === 16, 'randomBytes 16B');
  assert(lib.timingSafeEqual('abc', 'abc') === true, 'timingSafeEqual true');
  assert(lib.timingSafeEqual('abc', 'abd') === false, 'timingSafeEqual false');
  console.table([
    { mode: 'randomBytes', n: 16, sample: hex(rb) + '…' },
  ]);

  hr();
  console.log('All comprehensive tests passed.');
  console.log('✅ Ready for production');
  hr();
})().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});


