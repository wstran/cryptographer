#!/usr/bin/env node

/**
 * Password Hashing Examples
 * 
 * This file demonstrates different password hashing techniques
 * and security considerations.
 */

const crypto = require('cryptographer.js');
const nodeCrypto = require('crypto');

console.log('🔐 Password Hashing Examples\n');

// ===== ARGON2 PASSWORD HASHING =====
console.log('🥇 Argon2 - Recommended for New Applications:');

const password = 'my-secure-password';

// Argon2id (recommended variant)
console.log('\nArgon2id (Hybrid - Recommended):');
const argon2idHash = crypto.kdf.argon2(password, {
  salt: nodeCrypto.randomBytes(32),
  timeCost: 3,        // Number of iterations
  memoryCost: 4096,   // Memory usage in KB (4MB)
  parallelism: 1,     // Number of threads
  variant: 'argon2id',
  keyLength: 32
});
console.log(`Hash: ${argon2idHash}`);

// Argon2i (side-channel resistant)
console.log('\nArgon2i (Side-channel resistant):');
const argon2iHash = crypto.kdf.argon2(password, {
  salt: nodeCrypto.randomBytes(32),
  timeCost: 3,
  memoryCost: 4096,
  parallelism: 1,
  variant: 'argon2i',
  keyLength: 32
});
console.log(`Hash: ${argon2iHash}`);

// Different security levels
console.log('\nDifferent Security Levels:');

const lowSecurity = crypto.kdf.argon2(password, {
  salt: 'fixed-salt-for-demo',
  timeCost: 2,
  memoryCost: 1024,   // 1MB
  parallelism: 1,
  variant: 'argon2id'
});
console.log(`Low Security:  ${lowSecurity}`);

const highSecurity = crypto.kdf.argon2(password, {
  salt: 'fixed-salt-for-demo',
  timeCost: 5,
  memoryCost: 8192,   // 8MB
  parallelism: 2,
  variant: 'argon2id'
});
console.log(`High Security: ${highSecurity}`);

console.log();

// ===== BCRYPT PASSWORD HASHING =====
console.log('🔒 bcrypt - Widely Adopted Standard:');

// Basic bcrypt hashing
const bcryptHash = crypto.kdf.bcrypt.hash(password, { rounds: 10 });
console.log(`bcrypt Hash: ${bcryptHash}`);

// Verify password
const isValid = crypto.kdf.bcrypt.verify(password, bcryptHash);
console.log(`Password Valid: ${isValid}`);

const isInvalid = crypto.kdf.bcrypt.verify('wrong-password', bcryptHash);
console.log(`Wrong Password: ${isInvalid}`);

// Different cost factors
console.log('\nDifferent Cost Factors:');
const rounds8 = crypto.kdf.bcrypt.hash(password, { rounds: 8 });
const rounds12 = crypto.kdf.bcrypt.hash(password, { rounds: 12 });
const rounds14 = crypto.kdf.bcrypt.hash(password, { rounds: 14 });

console.log(`Rounds 8:  ${rounds8}`);
console.log(`Rounds 12: ${rounds12}`);
console.log(`Rounds 14: ${rounds14}`);

console.log();

// ===== PBKDF2 PASSWORD HASHING =====
console.log('🔑 PBKDF2 - Legacy but Still Secure:');

const pbkdf2Hash = crypto.kdf.pbkdf2(password, {
  salt: nodeCrypto.randomBytes(32),
  iterations: 100000,
  keyLength: 32
});
console.log(`PBKDF2 Hash: ${pbkdf2Hash}`);

// Different iteration counts
console.log('\nDifferent Iteration Counts:');
const salt = 'fixed-salt-for-demo';

const iter100k = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 100000,
  keyLength: 32
});

const iter250k = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 250000,
  keyLength: 32
});

const iter500k = crypto.kdf.pbkdf2(password, {
  salt: salt,
  iterations: 500000,
  keyLength: 32
});

console.log(`100k iterations: ${iter100k}`);
console.log(`250k iterations: ${iter250k}`);
console.log(`500k iterations: ${iter500k}`);

console.log();

// ===== COMPLETE PASSWORD MANAGEMENT SYSTEM =====
console.log('🏗️ Complete Password Management System:');

class PasswordManager {
  constructor() {
    this.algorithm = 'argon2id'; // Default algorithm
  }

  /**
   * Hash a password for storage
   */
  hashPassword(password, options = {}) {
    const algorithm = options.algorithm || this.algorithm;
    
    switch (algorithm) {
      case 'argon2id':
        return crypto.kdf.argon2(password, {
          salt: nodeCrypto.randomBytes(32),
          timeCost: options.timeCost || 3,
          memoryCost: options.memoryCost || 4096,
          parallelism: options.parallelism || 1,
          variant: 'argon2id',
          keyLength: 32
        });
        
      case 'bcrypt':
        return crypto.kdf.bcrypt.hash(password, {
          rounds: options.rounds || 12
        });
        
      case 'pbkdf2':
        return crypto.kdf.pbkdf2(password, {
          salt: nodeCrypto.randomBytes(32),
          iterations: options.iterations || 100000,
          keyLength: 32
        });
        
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }

  /**
   * Verify a password against a hash
   */
  verifyPassword(password, hash) {
    // bcrypt hashes start with $2a$, $2b$, or $2y$
    if (hash.startsWith('$2')) {
      return crypto.kdf.bcrypt.verify(password, hash);
    }
    
    // For this demo, we'll assume other hashes are Argon2 or PBKDF2
    // In a real implementation, you'd need to store the algorithm used
    console.log('Note: Non-bcrypt hash verification not implemented in this demo');
    return false;
  }

  /**
   * Benchmark different algorithms
   */
  benchmark() {
    console.log('\nPassword Hashing Benchmark:');
    const testPassword = 'benchmark-password';
    
    // Benchmark Argon2id
    console.time('Argon2id');
    const argon2Hash = this.hashPassword(testPassword, { algorithm: 'argon2id' });
    console.timeEnd('Argon2id');
    console.log(`Argon2id result: ${argon2Hash.substring(0, 50)}...`);
    
    // Benchmark bcrypt
    console.time('bcrypt');
    const bcryptHash = this.hashPassword(testPassword, { algorithm: 'bcrypt' });
    console.timeEnd('bcrypt');
    console.log(`bcrypt result: ${bcryptHash}`);
    
    // Benchmark PBKDF2
    console.time('PBKDF2');
    const pbkdf2Hash = this.hashPassword(testPassword, { algorithm: 'pbkdf2' });
    console.timeEnd('PBKDF2');
    console.log(`PBKDF2 result: ${pbkdf2Hash.substring(0, 50)}...`);
  }

  /**
   * Security recommendations
   */
  getRecommendations() {
    return {
      recommended: 'argon2id',
      alternatives: ['bcrypt', 'pbkdf2'],
      settings: {
        argon2id: {
          timeCost: 3,
          memoryCost: 4096, // 4MB
          parallelism: 1
        },
        bcrypt: {
          rounds: 12 // Minimum 10, recommended 12+
        },
        pbkdf2: {
          iterations: 100000 // Minimum 100k, recommended 150k+
        }
      },
      notes: [
        'Always use a random salt for each password',
        'Store the algorithm and parameters with the hash',
        'Consider upgrading hashes when users log in',
        'Monitor hashing time to prevent DoS attacks',
        'Use higher settings for admin/sensitive accounts'
      ]
    };
  }
}

// Demo the password manager
const passwordManager = new PasswordManager();

// Hash some passwords
const userPassword = 'user123password';
const adminPassword = 'admin-super-secure-password';

console.log('\nHashing user password (default settings):');
const userHash = passwordManager.hashPassword(userPassword);
console.log(`User hash: ${userHash.substring(0, 50)}...`);

console.log('\nHashing admin password (high security):');
const adminHash = passwordManager.hashPassword(adminPassword, {
  algorithm: 'argon2id',
  timeCost: 5,
  memoryCost: 8192
});
console.log(`Admin hash: ${adminHash.substring(0, 50)}...`);

console.log('\nHashing with bcrypt:');
const bcryptUserHash = passwordManager.hashPassword(userPassword, {
  algorithm: 'bcrypt',
  rounds: 12
});
console.log(`bcrypt hash: ${bcryptUserHash}`);

// Verify passwords
console.log('\nPassword verification:');
console.log(`bcrypt verify correct: ${passwordManager.verifyPassword(userPassword, bcryptUserHash)}`);
console.log(`bcrypt verify wrong: ${passwordManager.verifyPassword('wrong-password', bcryptUserHash)}`);

// Run benchmark
passwordManager.benchmark();

// Show recommendations
console.log('\nSecurity Recommendations:');
const recommendations = passwordManager.getRecommendations();
console.log(JSON.stringify(recommendations, null, 2));

console.log('\n🎉 Password hashing examples completed!');