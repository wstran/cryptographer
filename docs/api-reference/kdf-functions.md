# Key Derivation Functions (KDF)

cryptographer.js provides comprehensive key derivation and password hashing functions.

## Overview

Key Derivation Functions (KDF) are used for:

- Password hashing and verification
- Key stretching
- Salt generation and management
- Secure key derivation from passwords
- Password-based authentication systems

## Supported Algorithms

| Algorithm | Standard | Status | Use Case | Security Level |
|-----------|----------|---------|----------|----------------|
| **Argon2id** | RFC 9106 | ✅ Recommended | Password hashing | Very High |
| **Argon2i** | RFC 9106 | ✅ Recommended | Password hashing | Very High |
| **Argon2d** | RFC 9106 | ⚠️ Use with caution | Password hashing | High |
| **bcrypt** | - | ✅ Recommended | Password hashing | High |
| **PBKDF2** | RFC 2898 | ✅ Recommended | Key derivation | Medium |

## Basic Usage

### Argon2 (Recommended)

```javascript
import crypto from 'cryptographer.js';

// Argon2id (recommended for password hashing)
const passwordHash = await crypto.kdf.argon2('password', {
  salt: crypto.randomBytes(16),
  timeCost: 3,
  memoryCost: 65536, // 64MB
  parallelism: 4,
  variant: 'id' // 'id', 'i', or 'd'
});

// Argon2i (side-channel resistant)
const passwordHashI = await crypto.kdf.argon2('password', {
  salt: crypto.randomBytes(16),
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  variant: 'i'
});

// Argon2d (faster but vulnerable to side-channel attacks)
const passwordHashD = await crypto.kdf.argon2('password', {
  salt: crypto.randomBytes(16),
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  variant: 'd'
});
```

### bcrypt

```javascript
// Hash password with bcrypt
const bcryptHash = crypto.kdf.bcrypt.hash('password', { rounds: 12 });

// Verify password with bcrypt
const isValid = crypto.kdf.bcrypt.verify('password', bcryptHash);
console.log(isValid); // true
```

### PBKDF2

```javascript
// Derive key with PBKDF2
const derivedKey = crypto.kdf.pbkdf2('password', {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32,
  hash: 'sha256'
});

// Different output formats
const hexKey = crypto.kdf.pbkdf2('password', {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32,
  outputFormat: 'hex'
});

const base64Key = crypto.kdf.pbkdf2('password', {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32,
  outputFormat: 'base64'
});
```

## Advanced Usage

### Password Management System

```javascript
class PasswordManager {
  constructor() {
    this.defaultArgon2Options = {
      timeCost: 3,
      memoryCost: 65536, // 64MB
      parallelism: 4,
      variant: 'id'
    };
  }

  // Hash password with Argon2id
  async hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const hash = await crypto.kdf.argon2(password, {
      ...this.defaultArgon2Options,
      salt: salt
    });

    return {
      hash: hash,
      salt: salt.toString('hex'),
      algorithm: 'argon2id',
      options: this.defaultArgon2Options
    };
  }

  // Verify password
  async verifyPassword(password, storedHash) {
    const salt = Buffer.from(storedHash.salt, 'hex');

    const computedHash = await crypto.kdf.argon2(password, {
      ...storedHash.options,
      salt: salt
    });

    return crypto.timingSafeEqual(computedHash, storedHash.hash);
  }

  // Migrate from old algorithm
  async migratePassword(password, oldHash, oldAlgorithm) {
    // Verify with old algorithm
    let isValid = false;

    if (oldAlgorithm === 'bcrypt') {
      isValid = crypto.kdf.bcrypt.verify(password, oldHash);
    } else if (oldAlgorithm === 'pbkdf2') {
      // Verify with PBKDF2
      const parts = oldHash.split('$');
      const iterations = parseInt(parts[1]);
      const salt = parts[2];
      const hash = parts[3];

      const computedHash = crypto.kdf.pbkdf2(password, {
        salt: salt,
        iterations: iterations,
        keyLength: 32,
        outputFormat: 'hex'
      });

      isValid = crypto.timingSafeEqual(computedHash, hash);
    }

    if (isValid) {
      // Hash with new algorithm
      return await this.hashPassword(password);
    }

    return null;
  }
}

// Usage
const manager = new PasswordManager();

// Hash new password
const hashedPassword = await manager.hashPassword('myPassword');

// Verify password
const isValid = await manager.verifyPassword('myPassword', hashedPassword);

// Migrate from old system
const migratedHash = await manager.migratePassword('oldPassword', oldHash, 'bcrypt');
```

### Secure Key Derivation

```javascript
class KeyDerivation {
  constructor(masterPassword) {
    this.masterPassword = masterPassword;
  }

  // Derive encryption key
  deriveEncryptionKey(service, salt) {
    return crypto.kdf.pbkdf2(this.masterPassword, {
      salt: `${service}:${salt}`,
      iterations: 100000,
      keyLength: 32,
      hash: 'sha256'
    });
  }

  // Derive HMAC key
  deriveHmacKey(service, salt) {
    return crypto.kdf.pbkdf2(this.masterPassword, {
      salt: `hmac:${service}:${salt}`,
      iterations: 100000,
      keyLength: 32,
      hash: 'sha256'
    });
  }

  // Derive application-specific key
  deriveAppKey(appName, userId, salt) {
    return crypto.kdf.pbkdf2(this.masterPassword, {
      salt: `app:${appName}:${userId}:${salt}`,
      iterations: 100000,
      keyLength: 32,
      hash: 'sha256'
    });
  }
}

// Usage
const keyDerivation = new KeyDerivation('master-password');
const encryptionKey = keyDerivation.deriveEncryptionKey('database', 'db-salt');
const hmacKey = keyDerivation.deriveHmacKey('api', 'api-salt');
const appKey = keyDerivation.deriveAppKey('myapp', 'user123', 'app-salt');
```

### Multi-Factor Authentication

```javascript
class MFASystem {
  constructor() {
    this.argon2Options = {
      timeCost: 3,
      memoryCost: 65536,
      parallelism: 4,
      variant: 'id'
    };
  }

  // Hash password with multiple factors
  async hashPasswordWithFactors(password, factors) {
    const salt = crypto.randomBytes(16);

    // Combine password with factors
    const combined = `${password}:${factors.join(':')}`;

    const hash = await crypto.kdf.argon2(combined, {
      ...this.argon2Options,
      salt: salt
    });

    return {
      hash: hash,
      salt: salt.toString('hex'),
      factors: factors,
      algorithm: 'argon2id'
    };
  }

  // Verify with factors
  async verifyPasswordWithFactors(password, factors, storedHash) {
    const salt = Buffer.from(storedHash.salt, 'hex');
    const combined = `${password}:${factors.join(':')}`;

    const computedHash = await crypto.kdf.argon2(combined, {
      ...this.argon2Options,
      salt: salt
    });

    return crypto.timingSafeEqual(computedHash, storedHash.hash);
  }
}

// Usage
const mfa = new MFASystem();

// Hash with factors (e.g., device ID, PIN)
const hashed = await mfa.hashPasswordWithFactors('password', ['device123', '1234']);

// Verify with same factors
const isValid = await mfa.verifyPasswordWithFactors('password', ['device123', '1234'], hashed);
```

## Security Best Practices

### Parameter Selection

```javascript
// ✅ Good: Use recommended parameters for Argon2
const argon2Options = {
  timeCost: 3,        // 3 iterations
  memoryCost: 65536,  // 64MB memory
  parallelism: 4,     // 4 threads
  variant: 'id'       // Argon2id (recommended)
};

// ✅ Good: Use sufficient iterations for PBKDF2
const pbkdf2Options = {
  iterations: 100000, // At least 100,000 iterations
  keyLength: 32,      // 256-bit key
  hash: 'sha256'      // SHA-256
};

// ✅ Good: Use sufficient rounds for bcrypt
const bcryptOptions = {
  rounds: 12          // At least 10 rounds
};
```

### Salt Management

```javascript
// ✅ Good: Use cryptographically secure random salt
const salt = crypto.randomBytes(16);

// ✅ Good: Use unique salt per password
const userSalt = crypto.randomBytes(16);
const hash = await crypto.kdf.argon2(password, { salt: userSalt });

// ❌ Bad: Use weak salt
const weakSalt = 'salt123';

// ❌ Bad: Use same salt for all passwords
const sharedSalt = crypto.randomBytes(16); // Don't reuse!
```

### Timing-Safe Comparison

```javascript
// ✅ Good: Use timing-safe comparison
function verifyPassword(password, storedHash) {
  const computedHash = crypto.kdf.argon2(password, options);
  return crypto.timingSafeEqual(computedHash, storedHash);
}

// ❌ Bad: Use regular comparison (vulnerable to timing attacks)
function verifyPasswordBad(password, storedHash) {
  const computedHash = crypto.kdf.argon2(password, options);
  return computedHash === storedHash; // Vulnerable!
}
```

### Algorithm Selection

```javascript
// ✅ Good: Use Argon2id for new applications
const hash = await crypto.kdf.argon2(password, argon2Options);

// ✅ Good: Use bcrypt for legacy compatibility
const hash = crypto.kdf.bcrypt.hash(password, { rounds: 12 });

// ✅ Good: Use PBKDF2 for key derivation
const key = crypto.kdf.pbkdf2(password, pbkdf2Options);

// ⚠️ Use Argon2d only when speed is critical
const hash = await crypto.kdf.argon2(password, { ...options, variant: 'd' });
```

## Performance Comparison

Sample performance on M2 Max / Node 18:

| Algorithm | Parameters | Time (ms) | Memory | Security |
|-----------|------------|-----------|---------|----------|
| Argon2id | t=3, m=64MB, p=4 | 100 | 64MB | Very High |
| Argon2i | t=3, m=64MB, p=4 | 120 | 64MB | Very High |
| Argon2d | t=3, m=64MB, p=4 | 80 | 64MB | High |
| bcrypt | rounds=12 | 200 | 4KB | High |
| PBKDF2 | 100k iterations | 50 | 1KB | Medium |

## Error Handling

```javascript
try {
  const hash = await crypto.kdf.argon2(password, options);
} catch (error) {
  if (error.message.includes('Invalid salt')) {
    console.error('Invalid salt length or format');
  } else if (error.message.includes('Invalid parameters')) {
    console.error('Invalid Argon2 parameters');
  } else if (error.message.includes('Memory limit')) {
    console.error('Memory cost too high for available memory');
  } else if (error.message.includes('WebAssembly')) {
    console.error('WebAssembly module failed to load');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## TypeScript Support

```typescript
import crypto, {
  CryptoInput,
  Argon2Options,
  BcryptOptions,
  Pbkdf2Options
} from 'cryptographer.js';

// Type-safe Argon2
const argon2Options: Argon2Options = {
  salt: Buffer.from('salt'),
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  variant: 'id'
};

// Type-safe bcrypt
const bcryptOptions: BcryptOptions = {
  rounds: 12
};

// Type-safe PBKDF2
const pbkdf2Options: Pbkdf2Options = {
  salt: 'salt',
  iterations: 100000,
  keyLength: 32,
  hash: 'sha256'
};
```

## API Reference

### Function Signatures

```typescript
// Argon2
function argon2(password: CryptoInput, options: Argon2Options): Promise<string>

// bcrypt
function hash(password: CryptoInput, options?: BcryptOptions): string
function verify(password: CryptoInput, hash: string): boolean

// PBKDF2
function pbkdf2(password: CryptoInput, options: Pbkdf2Options): string | Buffer
```

### Types

```typescript
type CryptoInput = string | Buffer | Uint8Array;

type Argon2Variant = 'id' | 'i' | 'd';

interface Argon2Options {
  salt: Buffer;
  timeCost?: number;      // Default: 3
  memoryCost?: number;    // Default: 65536 (64MB)
  parallelism?: number;   // Default: 4
  variant?: Argon2Variant; // Default: 'id'
  keyLength?: number;     // Default: 32
  outputFormat?: 'hex' | 'base64' | 'buffer';
}

interface BcryptOptions {
  rounds?: number;        // Default: 10
}

interface Pbkdf2Options {
  salt: string | Buffer;
  iterations?: number;    // Default: 100000
  keyLength?: number;     // Default: 32
  hash?: 'sha1' | 'sha256' | 'sha512'; // Default: 'sha256'
  outputFormat?: 'hex' | 'base64' | 'buffer';
}
```

### Available Functions

- `crypto.kdf.argon2(password, options)`
- `crypto.kdf.bcrypt.hash(password, options?)`
- `crypto.kdf.bcrypt.verify(password, hash)`
- `crypto.kdf.pbkdf2(password, options)`

### Parameter Recommendations

#### Argon2
- **timeCost**: 3 (minimum), 4-5 for higher security
- **memoryCost**: 65536 (64MB minimum), 131072 (128MB) for higher security
- **parallelism**: 4 (good balance), 1-8 depending on hardware
- **variant**: 'id' (recommended), 'i' for side-channel resistance, 'd' for speed

#### bcrypt
- **rounds**: 12 (minimum), 14-16 for higher security

#### PBKDF2
- **iterations**: 100000 (minimum), 200000+ for higher security
- **hash**: 'sha256' (recommended), 'sha512' for higher security