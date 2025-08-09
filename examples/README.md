# cryptographer.js Examples

This directory contains comprehensive examples demonstrating how to use cryptographer.js for various cryptographic operations.

## 📁 Example Files

### [`basic-usage.js`](./basic-usage.js)
Complete overview of all basic functions in cryptographer.js including:
- Hash functions (SHA-256, BLAKE3, etc.)
- HMAC operations
- AES encryption/decryption
- Key derivation functions (PBKDF2, Argon2, bcrypt)
- Practical secure file storage example

**Run with:**
```bash
node examples/basic-usage.js
```

### [`password-hashing.js`](./password-hashing.js)
Comprehensive guide to password hashing techniques:
- Argon2 variants (argon2i, argon2d, argon2id)
- bcrypt with different cost factors
- PBKDF2 with various iteration counts
- Complete password management system
- Security recommendations and benchmarks

**Run with:**
```bash
node examples/password-hashing.js
```

### [`file-encryption.js`](./file-encryption.js)
File encryption examples covering:
- Basic file encryption/decryption
- Secure encryption with integrity protection
- Multiple file archives
- Streaming encryption for large files
- Security best practices

**Run with:**
```bash
node examples/file-encryption.js
```

## 🚀 Getting Started

### Prerequisites

Make sure you have cryptographer.js installed:

```bash
npm install cryptographer.js
```

### Running Examples

1. **Clone or download** the cryptographer.js repository
2. **Navigate** to the examples directory:
   ```bash
   cd examples
   ```
3. **Run any example**:
   ```bash
   node basic-usage.js
   node password-hashing.js
   node file-encryption.js
   ```

## 📚 What You'll Learn

### Hash Functions
- When to use SHA-256 vs BLAKE3 vs SHA-3
- Different output formats (hex, base64, buffer)
- Streaming hash operations for large data
- Performance comparisons

### HMAC
- Message authentication codes
- Key management best practices
- Timing-safe verification

### Encryption
- AES-256 with different modes (CBC, ECB, CTR)
- Proper IV generation and management
- File encryption with integrity protection
- Archive encryption

### Key Derivation
- Password hashing for authentication
- Key stretching techniques
- Salt generation and storage
- Parameter tuning for security vs performance

### Security Best Practices
- Input validation
- Error handling
- Timing attack prevention
- Rate limiting
- Secure random generation

## 🔒 Security Notes

These examples are designed for educational purposes and demonstrate secure practices. Key security considerations:

### ✅ Do's
- Always use random salts for password hashing
- Use appropriate iteration counts (PBKDF2: 100k+, bcrypt: 10+)
- Generate cryptographically secure random values for IVs and salts
- Verify integrity before decryption
- Use timing-safe comparison for authentication
- Validate all inputs

### ❌ Don'ts
- Don't use hardcoded keys or IVs in production
- Don't use weak passwords or keys
- Don't use deprecated algorithms (MD5, SHA-1) for security purposes
- Don't implement cryptography from scratch
- Don't ignore error handling

## 🛠️ Common Use Cases

### Web Application Authentication
```javascript
// Hash password for storage
const hashedPassword = crypto.kdf.argon2(password, {
  salt: crypto.randomBytes(32),
  timeCost: 3,
  memoryCost: 4096,
  variant: 'argon2id'
});

// Verify password during login
const isValid = crypto.kdf.bcrypt.verify(inputPassword, storedHash);
```

### API Request Signing
```javascript
// Sign API request
const timestamp = Date.now().toString();
const message = `${method}:${url}:${body}:${timestamp}`;
const signature = crypto.hmac.sha256(message, { key: apiSecret });
```

### Secure File Storage
```javascript
// Encrypt sensitive data
const key = crypto.kdf.pbkdf2(userPassword, {
  salt: fileSalt,
  iterations: 150000,
  keyLength: 32,
  outputFormat: 'buffer'
});

const encrypted = crypto.cipher.aes.encrypt(data, {
  key: key,
  iv: crypto.randomBytes(16),
  mode: 'CBC'
});
```

### Data Integrity Verification
```javascript
// Generate checksum
const checksum = crypto.sha.blake3(fileContent);

// Verify integrity
const isIntact = crypto.sha.blake3(receivedContent) === expectedChecksum;
```

## 📖 Additional Resources

- **Main Documentation**: [README.md](../README.md)
- **API Reference**: [API_REFERENCE.md](../API_REFERENCE.md)
- **Security Policy**: [SECURITY.md](../SECURITY.md)
- **Contributing Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)

## 🤝 Contributing Examples

Found a bug in an example or want to add a new one? We welcome contributions!

1. **Fork** the repository
2. **Create** a new example file
3. **Follow** the existing code style and documentation format
4. **Test** your example thoroughly
5. **Submit** a pull request

### Example Template

When creating new examples:

```javascript
#!/usr/bin/env node

/**
 * [Example Name]
 *
 * Brief description of what this example demonstrates.
 */

const crypto = require('cryptographer.js');

console.log('🔐 [Example Name]\n');

// Your example code here
// Include plenty of comments explaining each step
// Show both correct usage and common pitfalls to avoid

console.log('\n🎉 Example completed successfully!');
```

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/wstran/cryptographer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wstran/cryptographer/discussions)
- **Email**: [wilsontran@ronus.io](mailto:wilsontran@ronus.io)

---

**Remember**: These examples use real cryptographic functions. Always understand what you're doing before using cryptography in production systems!