#!/usr/bin/env node

/**
 * File Encryption Examples
 * 
 * This file demonstrates how to encrypt and decrypt files
 * using different approaches and security practices.
 */

const crypto = require('cryptographer.js');
const nodeCrypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('📁 File Encryption Examples\n');

// ===== UTILITY FUNCTIONS =====

/**
 * Create a temporary file with content
 */
function createTempFile(filename, content) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Clean up temporary files
 */
function cleanup() {
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir).forEach(file => {
      fs.unlinkSync(path.join(tempDir, file));
    });
    fs.rmdirSync(tempDir);
  }
}

// ===== BASIC FILE ENCRYPTION =====
console.log('🔐 Basic File Encryption:');

function encryptFile(filePath, password) {
  // Read file content
  const fileContent = fs.readFileSync(filePath);
  
  // Generate salt and derive key
  const salt = nodeCrypto.randomBytes(32);
  const key = crypto.kdf.pbkdf2(password, {
    salt: salt,
    iterations: 100000,
    keyLength: 32,
    outputFormat: 'buffer'
  });
  
  // Generate IV
  const iv = nodeCrypto.randomBytes(16);
  
  // Encrypt content
  const encryptedContent = crypto.cipher.aes.encrypt(fileContent, {
    key: key,
    iv: iv,
    mode: 'CBC'
  });
  
  // Create encrypted file structure
  const encryptedFile = {
    version: '1.0',
    algorithm: 'AES-256-CBC',
    kdf: 'PBKDF2',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: encryptedContent.toString('base64')
  };
  
  return JSON.stringify(encryptedFile, null, 2);
}

function decryptFile(encryptedData, password) {
  const fileData = JSON.parse(encryptedData);
  
  // Extract components
  const salt = Buffer.from(fileData.salt, 'base64');
  const iv = Buffer.from(fileData.iv, 'base64');
  const encryptedContent = Buffer.from(fileData.data, 'base64');
  
  // Derive key
  const key = crypto.kdf.pbkdf2(password, {
    salt: salt,
    iterations: 100000,
    keyLength: 32,
    outputFormat: 'buffer'
  });
  
  // Decrypt content
  const decryptedContent = crypto.cipher.aes.decrypt(encryptedContent, {
    key: key,
    iv: iv,
    mode: 'CBC'
  });
  
  return decryptedContent;
}

// Demo basic encryption
const testFile = createTempFile('test.txt', 'This is a secret document with sensitive information.');
const password = 'my-file-password';

console.log('Original file content:');
console.log(fs.readFileSync(testFile, 'utf8'));

const encryptedData = encryptFile(testFile, password);
console.log('\nEncrypted file data:');
console.log(encryptedData.substring(0, 200) + '...');

const decryptedContent = decryptFile(encryptedData, password);
console.log('\nDecrypted content:');
console.log(decryptedContent.toString());

console.log();

// ===== SECURE FILE ENCRYPTION WITH INTEGRITY =====
console.log('🛡️ Secure File Encryption with Integrity Check:');

class SecureFileEncryption {
  constructor() {
    this.version = '2.0';
    this.defaultKdfIterations = 150000;
  }

  /**
   * Encrypt a file with integrity protection
   */
  encryptFile(filePath, password, options = {}) {
    const fileContent = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    
    // Generate cryptographic materials
    const salt = nodeCrypto.randomBytes(32);
    const iv = nodeCrypto.randomBytes(16);
    const iterations = options.iterations || this.defaultKdfIterations;
    
    // Derive encryption key
    const encryptionKey = crypto.kdf.pbkdf2(password, {
      salt: salt,
      iterations: iterations,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    // Derive authentication key (different from encryption key)
    const authKey = crypto.kdf.pbkdf2(password, {
      salt: Buffer.concat([salt, Buffer.from('auth')]),
      iterations: iterations,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    // Encrypt the file
    const encryptedContent = crypto.cipher.aes.encrypt(fileContent, {
      key: encryptionKey,
      iv: iv,
      mode: 'CBC'
    });
    
    // Create metadata
    const metadata = {
      filename: filename,
      fileSize: fileContent.length,
      timestamp: new Date().toISOString(),
      version: this.version
    };
    
    // Create the complete data structure
    const fileStructure = {
      metadata: metadata,
      crypto: {
        algorithm: 'AES-256-CBC',
        kdf: 'PBKDF2',
        iterations: iterations,
        salt: salt.toString('base64'),
        iv: iv.toString('base64')
      },
      data: encryptedContent.toString('base64')
    };
    
    // Calculate HMAC for integrity
    const dataToAuthenticate = JSON.stringify(fileStructure);
    const hmac = crypto.hmac.sha256(dataToAuthenticate, {
      key: authKey,
      outputFormat: 'base64'
    });
    
    // Final structure with HMAC
    const finalStructure = {
      ...fileStructure,
      hmac: hmac
    };
    
    return JSON.stringify(finalStructure, null, 2);
  }

  /**
   * Decrypt a file with integrity verification
   */
  decryptFile(encryptedData, password) {
    const fileData = JSON.parse(encryptedData);
    
    // Extract HMAC
    const providedHmac = fileData.hmac;
    const dataWithoutHmac = { ...fileData };
    delete dataWithoutHmac.hmac;
    
    // Reconstruct authentication key
    const salt = Buffer.from(fileData.crypto.salt, 'base64');
    const iterations = fileData.crypto.iterations;
    
    const authKey = crypto.kdf.pbkdf2(password, {
      salt: Buffer.concat([salt, Buffer.from('auth')]),
      iterations: iterations,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    // Verify HMAC
    const dataToAuthenticate = JSON.stringify(dataWithoutHmac);
    const computedHmac = crypto.hmac.sha256(dataToAuthenticate, {
      key: authKey,
      outputFormat: 'base64'
    });
    
    if (computedHmac !== providedHmac) {
      throw new Error('File integrity check failed! File may have been tampered with.');
    }
    
    // Derive encryption key
    const encryptionKey = crypto.kdf.pbkdf2(password, {
      salt: salt,
      iterations: iterations,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    // Decrypt the file
    const iv = Buffer.from(fileData.crypto.iv, 'base64');
    const encryptedContent = Buffer.from(fileData.data, 'base64');
    
    const decryptedContent = crypto.cipher.aes.decrypt(encryptedContent, {
      key: encryptionKey,
      iv: iv,
      mode: 'CBC'
    });
    
    return {
      content: decryptedContent,
      metadata: fileData.metadata
    };
  }

  /**
   * Encrypt multiple files into an archive
   */
  encryptArchive(filePaths, password) {
    const archive = {
      version: this.version,
      created: new Date().toISOString(),
      files: {}
    };
    
    filePaths.forEach(filePath => {
      const filename = path.basename(filePath);
      const content = fs.readFileSync(filePath);
      
      // Use a unique salt for each file
      const salt = nodeCrypto.randomBytes(32);
      const iv = nodeCrypto.randomBytes(16);
      
      const key = crypto.kdf.pbkdf2(password, {
        salt: salt,
        iterations: this.defaultKdfIterations,
        keyLength: 32,
        outputFormat: 'buffer'
      });
      
      const encrypted = crypto.cipher.aes.encrypt(content, {
        key: key,
        iv: iv,
        mode: 'CBC'
      });
      
      archive.files[filename] = {
        size: content.length,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        data: encrypted.toString('base64')
      };
    });
    
    return JSON.stringify(archive, null, 2);
  }
}

// Demo secure encryption
const secureEncryption = new SecureFileEncryption();

const sensitiveFile = createTempFile('sensitive.txt', 
  'Top Secret Document\n' +
  '==================\n' +
  'This document contains highly sensitive information.\n' +
  'Bank Account: 1234567890\n' +
  'Social Security: 123-45-6789\n' +
  'Password: mySecretPassword123'
);

console.log('Encrypting sensitive file...');
const secureEncryptedData = secureEncryption.encryptFile(sensitiveFile, password);

console.log('Encrypted file structure:');
const parsedData = JSON.parse(secureEncryptedData);
console.log(`Version: ${parsedData.version}`);
console.log(`Filename: ${parsedData.metadata.filename}`);
console.log(`Algorithm: ${parsedData.crypto.algorithm}`);
console.log(`KDF: ${parsedData.crypto.kdf} (${parsedData.crypto.iterations} iterations)`);
console.log(`HMAC: ${parsedData.hmac.substring(0, 20)}...`);

console.log('\nDecrypting file...');
const decryptedResult = secureEncryption.decryptFile(secureEncryptedData, password);
console.log('✓ Integrity check passed');
console.log(`Original filename: ${decryptedResult.metadata.filename}`);
console.log(`Original size: ${decryptedResult.metadata.fileSize} bytes`);
console.log('Decrypted content:');
console.log(decryptedResult.content.toString());

console.log();

// ===== STREAMING FILE ENCRYPTION =====
console.log('🌊 Streaming File Encryption (for large files):');

class StreamingFileEncryption {
  /**
   * Encrypt large files in chunks to avoid memory issues
   */
  encryptLargeFile(inputPath, outputPath, password, chunkSize = 64 * 1024) {
    const salt = nodeCrypto.randomBytes(32);
    const iv = nodeCrypto.randomBytes(16);
    
    // Derive key
    const key = crypto.kdf.pbkdf2(password, {
      salt: salt,
      iterations: 100000,
      keyLength: 32,
      outputFormat: 'buffer'
    });
    
    // Create header
    const header = {
      version: '1.0',
      algorithm: 'AES-256-CBC',
      kdf: 'PBKDF2',
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      chunkSize: chunkSize
    };
    
    const headerData = Buffer.from(JSON.stringify(header));
    const headerLength = Buffer.alloc(4);
    headerLength.writeUInt32BE(headerData.length, 0);
    
    // Write header to output file
    fs.writeFileSync(outputPath, Buffer.concat([headerLength, headerData]));
    
    // Process file in chunks
    const inputFd = fs.openSync(inputPath, 'r');
    const outputFd = fs.openSync(outputPath, 'a');
    
    try {
      const buffer = Buffer.alloc(chunkSize);
      let position = 0;
      
      while (true) {
        const bytesRead = fs.readSync(inputFd, buffer, 0, chunkSize, position);
        if (bytesRead === 0) break;
        
        const chunk = buffer.slice(0, bytesRead);
        
        // For simplicity, we're not implementing proper streaming cipher mode
        // In a real implementation, you'd use CTR mode or implement proper padding
        console.log(`Processing chunk at position ${position}, size: ${bytesRead}`);
        
        position += bytesRead;
      }
      
      console.log(`✓ Large file encryption completed: ${outputPath}`);
    } finally {
      fs.closeSync(inputFd);
      fs.closeSync(outputFd);
    }
  }
}

// Create a larger test file
const largeContent = 'This is a large file content. '.repeat(1000);
const largeFile = createTempFile('large.txt', largeContent);

console.log(`Large file size: ${fs.statSync(largeFile).size} bytes`);

// Note: This is a simplified demonstration
// In production, you'd want to implement proper streaming encryption
console.log('Note: Streaming encryption is conceptual in this demo');

console.log();

// ===== MULTIPLE FILES ARCHIVE =====
console.log('📦 Multiple Files Archive:');

// Create multiple test files
const file1 = createTempFile('document1.txt', 'First document content');
const file2 = createTempFile('document2.txt', 'Second document content');
const file3 = createTempFile('notes.txt', 'Personal notes and reminders');

const archiveData = secureEncryption.encryptArchive([file1, file2, file3], password);

console.log('Created encrypted archive with 3 files');
console.log('Archive structure:');
const archive = JSON.parse(archiveData);
console.log(`Version: ${archive.version}`);
console.log(`Created: ${archive.created}`);
console.log(`Files: ${Object.keys(archive.files).join(', ')}`);

console.log();

// ===== SECURITY RECOMMENDATIONS =====
console.log('🔒 Security Recommendations:');

const recommendations = {
  keyDerivation: {
    algorithm: 'PBKDF2 or Argon2',
    minIterations: 100000,
    recommendedIterations: 150000,
    saltSize: 32
  },
  encryption: {
    algorithm: 'AES-256-CBC or AES-256-CTR',
    keySize: 32,
    ivSize: 16,
    useRandomIV: true
  },
  integrity: {
    algorithm: 'HMAC-SHA256',
    separateAuthKey: true,
    verifyBeforeDecryption: true
  },
  fileHandling: {
    useStreamingForLargeFiles: true,
    securelyDeleteOriginals: true,
    backupEncryptedFiles: true
  },
  passwordSecurity: {
    minLength: 12,
    useStrongPasswords: true,
    considerKeyFiles: true,
    avoidPasswordReuse: true
  }
};

console.log(JSON.stringify(recommendations, null, 2));

// Cleanup
cleanup();

console.log('\n🎉 File encryption examples completed!');