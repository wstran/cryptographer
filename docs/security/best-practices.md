### Cipher selection

- Prefer AES-GCM or ChaCha20-Poly1305 for authenticated encryption.
- Prefer AES-256-CBC or ChaCha20 (with separate MAC) if AEAD is not available.
- Avoid ECB mode entirely; in this library ECB selector is mapped to CTR with zero IV only for compatibility.
- Avoid DES/3DES; only use for legacy interoperability with strict key/IV handling.

### Asymmetric

- Use RSA-OAEP (SHA-256+) để mã hóa payload nhỏ như session keys; không dùng cho dữ liệu lớn.
- Dùng X25519 hoặc ECDH P-256/P-384 cho key exchange; dẫn xuất khóa đối xứng qua HKDF.

### Nonce/IV management

- AES-GCM requires a 12-byte nonce. Never reuse a nonce with the same key.
- AES CBC/CTR require a 16-byte IV. Never reuse an IV with the same key.
- ChaCha20 and ChaCha20-Poly1305 require a 12-byte nonce. Never reuse a nonce with the same key.
- DES/3DES CBC/CTR use an 8-byte IV; treat reuse as catastrophic.
# Security Best Practices

This guide covers essential security best practices when using cryptographer.js in production applications.

## Algorithm Selection

### Hash Functions

```javascript
// ✅ Recommended for new applications
const hash = crypto.sha.sha256(data);     // General purpose
const hash = crypto.sha.blake3(data);     // Speed critical
const hash = crypto.sha.sha3_256(data);   // Future-proof

// ⚠️ Use only for legacy compatibility
const hash = crypto.sha.sha1(data);       // Cryptographically broken
const hash = crypto.sha.md5(data);        // Cryptographically broken
const hash = crypto.sha.md4(data);        // Cryptographically broken
```

### Password Hashing

```javascript
// ✅ Recommended for password hashing
const hash = await crypto.kdf.argon2(password, {
  salt: crypto.randomBytes(16),
  timeCost: 3,
  memoryCost: 65536, // 64MB
  parallelism: 4,
  variant: 'id'
});

// ✅ Good for legacy compatibility
const hash = crypto.kdf.bcrypt.hash(password, { rounds: 12 });

// ✅ Good for key derivation
const key = crypto.kdf.pbkdf2(password, {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32
});

// ❌ Never use hash functions for passwords
const hash = crypto.sha.sha256(password); // Vulnerable!
```

### Encryption

```javascript
// ✅ Recommended for most use cases (AEAD)
const n12 = crypto.randomBytes(12);
const encGcm = crypto.cipher.aes.encrypt(data, {
  key: key,
  iv: n12,          // 12-byte nonce
  mode: 'gcm'
});

j// ⚠️ CTR mode (no integrity). Pair with HMAC if you must use it
const n16 = crypto.randomBytes(16);
const encCtr = crypto.cipher.aes.encrypt(data, {
  key: key,
  iv: n16,          // 16-byte IV/nonce
  mode: 'ctr'
});
const mac = crypto.hmac.sha256(Buffer.concat([n16, encCtr]), { key });

// ⚠️ CBC mode requires separate MAC. Prefer GCM/ChaCha20-Poly1305 instead
const iv16 = crypto.randomBytes(16);
const encCbc = crypto.cipher.aes.encrypt(data, {
  key: key,
  iv: iv16,         // 16-byte IV
  mode: 'cbc'
});
const mac2 = crypto.hmac.sha256(Buffer.concat([iv16, encCbc]), { key });

// ❌ Avoid ECB (no IV, reveals patterns)
const encEcb = crypto.cipher.aes.encrypt(data, {
  key: key,
  mode: 'ecb'
});
```

## Key Management

### Generate Strong Keys

```javascript
// ✅ Good: Use cryptographically secure random keys
const crypto = require('crypto');

// AES-256 key (32 bytes)
const aesKey = crypto.randomBytes(32);

// HMAC key (32 bytes)
const hmacKey = crypto.randomBytes(32);

// IV for AES (16 bytes)
const iv = crypto.randomBytes(16);

// Salt for KDF (16 bytes)
const salt = crypto.randomBytes(16);

// ❌ Bad: Use weak keys
const weakKey = 'password123';
const weakKey = Buffer.from('weak-key', 'utf8');
```

### Key Derivation

```javascript
// ✅ Good: Derive keys from master password
const masterKey = crypto.randomBytes(32);

// Derive encryption key
const encryptionKey = crypto.kdf.pbkdf2(masterKey, {
  salt: 'encryption-salt',
  iterations: 100000,
  keyLength: 32
});

// Derive HMAC key
const hmacKey = crypto.kdf.pbkdf2(masterKey, {
  salt: 'hmac-salt',
  iterations: 100000,
  keyLength: 32
});

// Derive application-specific key
const appKey = crypto.kdf.pbkdf2(masterKey, {
  salt: `app:${appName}:${userId}`,
  iterations: 100000,
  keyLength: 32
});
```

### Key Storage

```javascript
// ✅ Good: Use environment variables for sensitive keys
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const hmacKey = Buffer.from(process.env.HMAC_KEY, 'hex');

// ✅ Good: Use secure key management services
// AWS KMS, Azure Key Vault, Google Cloud KMS, etc.

// ❌ Bad: Hardcode keys in source code
const key = 'my-secret-key-123';
```

## Salt Management

### Use Unique Salts

```javascript
// ✅ Good: Generate unique salt for each password
const salt = crypto.randomBytes(16);
const hash = await crypto.kdf.argon2(password, { salt });

// ✅ Good: Store salt with hash
const storedData = {
  hash: hash,
  salt: salt.toString('hex'),
  algorithm: 'argon2id'
};

// ❌ Bad: Use same salt for all passwords
const sharedSalt = crypto.randomBytes(16); // Don't reuse!

// ❌ Bad: Use weak salt
const weakSalt = 'salt123';
```

### Salt Length

```javascript
// ✅ Good: Use sufficient salt length
const salt = crypto.randomBytes(16); // 128 bits

// For higher security
const salt = crypto.randomBytes(32); // 256 bits

// ❌ Bad: Use short salt
const shortSalt = crypto.randomBytes(8); // Too short
```

## Parameter Selection

### Argon2 Parameters

```javascript
// ✅ Good: Use recommended parameters
const argon2Options = {
  timeCost: 3,        // 3 iterations (minimum)
  memoryCost: 65536,  // 64MB memory (minimum)
  parallelism: 4,     // 4 threads (good balance)
  variant: 'id'       // Argon2id (recommended)
};

// For higher security
const highSecurityOptions = {
  timeCost: 4,        // 4 iterations
  memoryCost: 131072, // 128MB memory
  parallelism: 4,     // 4 threads
  variant: 'id'
};

// For side-channel resistance
const sideChannelResistant = {
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  variant: 'i'        // Argon2i
};
```

### PBKDF2 Parameters

```javascript
// ✅ Good: Use sufficient iterations
const pbkdf2Options = {
  iterations: 100000, // Minimum 100,000
  keyLength: 32,      // 256-bit key
  hash: 'sha256'      // SHA-256
};

// For higher security
const highSecurityPbkdf2 = {
  iterations: 200000, // 200,000 iterations
  keyLength: 32,
  hash: 'sha512'      // SHA-512
};
```

### bcrypt Parameters

```javascript
// ✅ Good: Use sufficient rounds
const bcryptOptions = {
  rounds: 12          // Minimum 10, recommended 12
};

// For higher security
const highSecurityBcrypt = {
  rounds: 14          // 14 rounds for higher security
};
```

## Timing Attacks

### Use Timing-Safe Comparison

```javascript
// ✅ Good: Use timing-safe comparison
function verifyPassword(password, storedHash) {
  const computedHash = await crypto.kdf.argon2(password, options);
  return crypto.timingSafeEqual(computedHash, storedHash);
}

// ✅ Good: Use timing-safe HMAC verification
function verifyHmac(message, key, signature) {
  const expectedSignature = crypto.hmac.sha256(message, { key });
  return crypto.timingSafeEqual(signature, expectedSignature);
}

// ❌ Bad: Use regular comparison (vulnerable to timing attacks)
function verifyPasswordBad(password, storedHash) {
  const computedHash = await crypto.kdf.argon2(password, options);
  return computedHash === storedHash; // Vulnerable!
}
```

### Constant-Time Operations

```javascript
// ✅ Good: Use constant-time operations where possible
const hash = crypto.sha.sha256(data); // Constant-time

// ✅ Good: Use constant-time HMAC
const hmac = crypto.hmac.sha256(data, { key });

// ⚠️ Be careful with variable-time operations
const derivedKey = crypto.kdf.pbkdf2(password, options); // Variable-time by design
```

## Input Validation

### Validate Input Parameters

```javascript
// ✅ Good: Validate key lengths
function encryptData(data, key) {
  if (key.length !== 32) {
    throw new Error('AES-256 requires 32-byte key');
  }

  if (data.length === 0) {
    throw new Error('Data cannot be empty');
  }

  return crypto.cipher.aes.encrypt(data, { key, iv });
}

// ✅ Good: Validate salt
function hashPassword(password, salt) {
  if (salt.length < 16) {
    throw new Error('Salt must be at least 16 bytes');
  }

  return crypto.kdf.argon2(password, { salt });
}

// ✅ Good: Validate iterations
function deriveKey(password, salt, iterations) {
  if (iterations < 100000) {
    throw new Error('PBKDF2 requires at least 100,000 iterations');
  }

  return crypto.kdf.pbkdf2(password, { salt, iterations });
}
```

### Sanitize Input

```javascript
// ✅ Good: Sanitize input data
function processData(input) {
  if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
    throw new Error('Input must be string or Buffer');
  }

  // Convert to Buffer for consistent processing
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');

  return crypto.sha.sha256(buffer);
}
```

## Error Handling

### Don't Expose Sensitive Information

```javascript
// ✅ Good: Generic error messages
try {
  const hash = await crypto.kdf.argon2(password, options);
} catch (error) {
  console.error('Password hashing failed');
  // Log error internally for debugging
  console.error('Internal error:', error.message);
}

// ❌ Bad: Expose sensitive information
try {
  const hash = await crypto.kdf.argon2(password, options);
} catch (error) {
  console.error('Failed to hash password:', password); // Exposes password!
}
```

### Handle Errors Gracefully

```javascript
// ✅ Good: Comprehensive error handling
function secureOperation(data, key) {
  try {
    // Validate inputs
    if (!data || !key) {
      throw new Error('Missing required parameters');
    }

    if (key.length !== 32) {
      throw new Error('Invalid key length');
    }

    // Perform operation
    return crypto.cipher.aes.encrypt(data, { key, iv });

  } catch (error) {
    if (error.message.includes('Invalid key length')) {
      throw new Error('Invalid encryption key');
    } else if (error.message.includes('WebAssembly')) {
      throw new Error('Cryptographic module failed to load');
    } else {
      throw new Error('Encryption failed');
    }
  }
}
```

## Memory Management

### Clear Sensitive Data

```javascript
// ✅ Good: Clear sensitive data from memory
function processSensitiveData(password) {
  const buffer = Buffer.from(password, 'utf8');

  try {
    const hash = crypto.kdf.argon2(buffer, options);
    return hash;
  } finally {
    // Clear sensitive data from memory
    buffer.fill(0);
  }
}

// ✅ Good: Use WeakRef for automatic cleanup
class SecureProcessor {
  constructor() {
    this.sensitiveData = new WeakRef(new Map());
  }

  process(data) {
    const id = crypto.randomBytes(16);
    this.sensitiveData.deref().set(id, data);

    try {
      return this.performOperation(data);
    } finally {
      this.sensitiveData.deref().delete(id);
    }
  }
}
```

## Secure Communication

### Authenticated Encryption

```javascript
// ✅ Good: Combine encryption with HMAC
function encryptWithAuth(data, key) {
  const iv = crypto.randomBytes(16);
  const encrypted = crypto.cipher.aes.encrypt(data, { key, iv, mode: 'cbc' });
  const hmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), { key });

  return {
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex'),
    hmac: hmac
  };
}

function decryptWithAuth(packet, key) {
  const iv = Buffer.from(packet.iv, 'hex');
  const encrypted = Buffer.from(packet.encrypted, 'hex');

  // Verify HMAC first
  const expectedHmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), { key });
  if (packet.hmac !== expectedHmac) {
    throw new Error('Integrity check failed');
  }

  return crypto.cipher.aes.decrypt(encrypted, { key, iv, mode: 'cbc' });
}
```

### Secure Key Exchange

```javascript
// ✅ Good: Use secure key derivation for shared secrets
class SecureChannel {
  constructor(sharedSecret) {
    this.sharedSecret = sharedSecret;
  }

  deriveSessionKey(sessionId) {
    return crypto.kdf.pbkdf2(this.sharedSecret, {
      salt: `session:${sessionId}`,
      iterations: 100000,
      keyLength: 32
    });
  }

  encryptMessage(message, sessionId) {
    const sessionKey = this.deriveSessionKey(sessionId);
    const iv = crypto.randomBytes(16);

    const encrypted = crypto.cipher.aes.encrypt(message, {
      key: sessionKey,
      iv: iv,
      mode: 'cbc'
    });

    const hmac = crypto.hmac.sha256(Buffer.concat([iv, encrypted]), {
      key: sessionKey
    });

    return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex'), hmac };
  }
}
```

## Audit and Monitoring

### Log Security Events

```javascript
// ✅ Good: Log security-relevant events
class SecurityLogger {
  logHashOperation(algorithm, inputLength) {
    console.log(`Hash operation: ${algorithm}, input length: ${inputLength}`);
  }

  logEncryptionOperation(algorithm, keyLength) {
    console.log(`Encryption operation: ${algorithm}, key length: ${keyLength}`);
  }

  logFailedVerification(operation) {
    console.warn(`Failed verification: ${operation}`);
    // Alert security team
  }
}

// Usage
const logger = new SecurityLogger();

function secureHash(data) {
  logger.logHashOperation('SHA-256', data.length);
  return crypto.sha.sha256(data);
}
```

### Monitor Performance

```javascript
// ✅ Good: Monitor cryptographic performance
class CryptoMonitor {
  measureOperation(operation, name) {
    const start = process.hrtime.bigint();
    const result = operation();
    const end = process.hrtime.bigint();

    const duration = Number(end - start) / 1000000; // milliseconds
    console.log(`${name} took ${duration.toFixed(2)}ms`);

    return result;
  }
}

// Usage
const monitor = new CryptoMonitor();

const hash = monitor.measureOperation(
  () => crypto.sha.sha256('data'),
  'SHA-256'
);
```

## Compliance and Standards

### FIPS Compliance

```javascript
// ✅ Good: Use FIPS-compliant algorithms
const fipsCompliantHash = crypto.sha.sha256(data);     // FIPS 180-4
const fipsCompliantEncryption = crypto.cipher.aes.encrypt(data, options); // FIPS 197

// ✅ Good: Use NIST-recommended parameters
const nistCompliantKdf = crypto.kdf.pbkdf2(password, {
  iterations: 100000, // NIST minimum
  keyLength: 32,      // 256 bits
  hash: 'sha256'      // SHA-256
});
```

### GDPR Compliance

```javascript
// ✅ Good: Implement data minimization
function hashUserData(userData) {
  // Only hash necessary fields
  const essentialData = {
    email: userData.email,
    userId: userData.id
  };

  return crypto.sha.sha256(JSON.stringify(essentialData));
}

// ✅ Good: Implement data deletion
function deleteUserData(userId) {
  // Securely delete cryptographic keys
  const key = deriveUserKey(userId);
  key.fill(0); // Clear from memory

  // Delete encrypted data
  deleteEncryptedData(userId);
}
```

## Testing Security

### Test for Common Vulnerabilities

```javascript
// ✅ Good: Test timing attack resistance
function testTimingAttackResistance() {
  const password = 'correctPassword';
  const wrongPassword = 'wrongPassword';
  const hash = crypto.kdf.argon2(password, options);

  const correctStart = process.hrtime.bigint();
  crypto.kdf.bcrypt.verify(password, hash);
  const correctEnd = process.hrtime.bigint();

  const wrongStart = process.hrtime.bigint();
  crypto.kdf.bcrypt.verify(wrongPassword, hash);
  const wrongEnd = process.hrtime.bigint();

  const correctTime = Number(correctEnd - correctStart);
  const wrongTime = Number(wrongEnd - wrongStart);

  // Times should be similar (within 10%)
  const difference = Math.abs(correctTime - wrongTime) / Math.max(correctTime, wrongTime);
  console.assert(difference < 0.1, 'Timing attack vulnerability detected');
}
```

### Penetration Testing

```javascript
// ✅ Good: Test parameter validation
function testParameterValidation() {
  // Test invalid key lengths
  try {
    crypto.cipher.aes.encrypt('data', { key: Buffer.alloc(16) }); // Should fail for AES-256
    throw new Error('Should have failed');
  } catch (error) {
    console.log('Correctly rejected invalid key length');
  }

  // Test invalid salt
  try {
    crypto.kdf.argon2('password', { salt: Buffer.alloc(8) }); // Too short
    throw new Error('Should have failed');
  } catch (error) {
    console.log('Correctly rejected invalid salt');
  }
}
```

## Summary

Follow these security best practices:

1. **Use recommended algorithms** (SHA-256, Argon2id, AES-256)
2. **Generate strong, random keys** and salts
3. **Use timing-safe comparisons** to prevent timing attacks
4. **Validate all inputs** before processing
5. **Handle errors securely** without exposing sensitive information
6. **Clear sensitive data** from memory when done
7. **Use authenticated encryption** for secure communication
8. **Monitor and log** security events
9. **Test for vulnerabilities** regularly
10. **Stay compliant** with relevant standards

Remember: Security is an ongoing process, not a one-time implementation.