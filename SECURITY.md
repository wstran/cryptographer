# Security Policy

## Our Commitment

The security of cryptographer.js is of paramount importance to us. We take all security vulnerabilities seriously and are committed to addressing them promptly and transparently.

## Supported Versions

We currently support the following versions of cryptographer.js with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Cryptographic Standards

### Algorithms Implemented

All cryptographic algorithms in cryptographer.js are implemented using:

- **Industry-standard specifications** (FIPS, RFC, NIST)
- **Well-vetted Rust cryptography crates** from the RustCrypto organization
- **Memory-safe implementations** to prevent buffer overflows and memory corruption
- **Constant-time operations** where applicable to prevent timing attacks

### Hash Functions

| Algorithm | Standard | Implementation | Status |
|-----------|----------|---------------|---------|
| SHA-1 | RFC 3174 | RustCrypto/sha1 | ⚠️ Legacy only |
| SHA-256 | FIPS 180-4 | RustCrypto/sha2 | ✅ Recommended |
| SHA-512 | FIPS 180-4 | RustCrypto/sha2 | ✅ Recommended |
| SHA3-256 | FIPS 202 | RustCrypto/sha3 | ✅ Recommended |
| SHA3-512 | FIPS 202 | RustCrypto/sha3 | ✅ Recommended |
| MD5 | RFC 1321 | RustCrypto/md5 | ⚠️ Legacy only |
| MD4 | RFC 1320 | RustCrypto/md4 | ⚠️ Legacy only |
| BLAKE2b | RFC 7693 | RustCrypto/blake2 | ✅ Recommended |
| BLAKE2s | RFC 7693 | RustCrypto/blake2 | ✅ Recommended |
| BLAKE3 | - | blake3-team/BLAKE3 | ✅ Recommended |

### Cipher Functions

| Algorithm | Mode | Standard | Implementation | Status |
|-----------|------|----------|---------------|---------|
| AES-128 | CBC, ECB, CTR | FIPS 197 | RustCrypto/aes | ✅ Recommended |
| AES-192 | CBC, ECB, CTR | FIPS 197 | RustCrypto/aes | ✅ Recommended |
| AES-256 | CBC, ECB, CTR | FIPS 197 | RustCrypto/aes | ✅ Recommended |

### Key Derivation Functions

| Algorithm | Standard | Implementation | Status |
|-----------|----------|---------------|---------|
| PBKDF2 | RFC 2898 | RustCrypto/pbkdf2 | ✅ Recommended |
| Argon2id | RFC 9106 | RustCrypto/argon2 | ✅ Recommended |
| Argon2i | RFC 9106 | RustCrypto/argon2 | ✅ Recommended |
| Argon2d | RFC 9106 | RustCrypto/argon2 | ⚠️ Use with caution |
| bcrypt | - | RustCrypto/bcrypt | ✅ Recommended |

## Security Best Practices

### For Users

1. **Use Strong Parameters**
   - Use recommended iterations for PBKDF2 (≥100,000)
   - Use appropriate memory cost for Argon2 (≥4MB)
   - Use sufficient bcrypt rounds (≥10)

2. **Generate Secure Random Values**
   ```javascript
   // Use Node.js crypto for secure random generation
   const crypto = require('crypto');
   const salt = crypto.randomBytes(32);
   const iv = crypto.randomBytes(16);
   ```

3. **Choose Appropriate Algorithms**
   - Prefer SHA-256/SHA-512 over SHA-1
   - Prefer BLAKE2/BLAKE3/SHA-3 for new applications
   - Avoid MD4/MD5 except for legacy compatibility
   - Use Argon2id for password hashing
   - Use AES-256 with CBC or CTR mode

4. **Validate Input Parameters**
   ```javascript
   // Always validate key lengths
   if (key.length !== 32) {
     throw new Error('AES-256 requires 32-byte key');
   }
   ```

5. **Handle Errors Securely**
   - Don't expose sensitive information in error messages
   - Use constant-time comparison for authentication

### For Developers

1. **Secure Development Practices**
   - Never hardcode cryptographic keys
   - Use secure random number generation
   - Clear sensitive data from memory when possible
   - Validate all inputs before processing

2. **Testing Security**
   - Test with known attack vectors
   - Verify against test vectors from standards
   - Test edge cases and error conditions
   - Benchmark for timing attack resistance

## Known Limitations

1. **Side-Channel Attacks**
   - While we implement constant-time operations where possible, WebAssembly and JavaScript environments may introduce timing variations
   - Consider your threat model when using in security-critical applications

2. **Memory Security**
   - JavaScript and WebAssembly cannot guarantee secure memory clearing
   - Sensitive data may remain in memory longer than expected

3. **Random Number Generation**
   - This library does not provide random number generation
   - Users must provide their own secure random values for salts, IVs, and keys

## Reporting a Vulnerability

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities. Instead:

1. **Email**: Send detailed information to **wilsontran@ronus.io**
2. **Subject Line**: `[SECURITY] cryptographer.js vulnerability report`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### What to Expect

1. **Acknowledgment**: Within 48 hours of your report
2. **Initial Assessment**: Within 1 week
3. **Regular Updates**: Every week until resolution
4. **Disclosure Timeline**: 90 days from initial report (negotiable)

### Our Response Process

1. **Confirmation**: We'll confirm the vulnerability and assess its severity
2. **Fix Development**: We'll develop and test a fix
3. **Coordinated Disclosure**: We'll work with you on disclosure timing
4. **Release**: We'll release a security update
5. **Public Disclosure**: We'll publish a security advisory

### Severity Classification

We use the following severity levels:

- **Critical**: Remote code execution, cryptographic bypass
- **High**: Local privilege escalation, key recovery
- **Medium**: Information disclosure, denial of service
- **Low**: Minor issues with limited impact

### Bug Bounty

While we don't currently offer a formal bug bounty program, we deeply appreciate security researchers who help improve our security. We will:

- Acknowledge your contribution in our security advisories
- Provide you with early access to fixes for testing
- Consider you for our contributors list

## Security Advisories

Published security advisories will be available at:
- GitHub Security Advisories: https://github.com/wstran/cryptographer/security/advisories
- npm Security: https://www.npmjs.com/advisories

## Compliance and Certifications

### Standards Compliance

- **FIPS 140-2**: Algorithms implemented follow FIPS-approved specifications
- **Common Criteria**: Design follows security principles outlined in CC
- **NIST Guidelines**: Implementation follows NIST cryptographic recommendations

### Third-Party Security

- **Dependencies**: All Rust dependencies are from reputable sources (primarily RustCrypto)
- **Audits**: We encourage third-party security audits and will publish results
- **Vulnerability Scanning**: Regular automated scanning for known vulnerabilities

## Security Resources

### For Further Reading

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [RustCrypto Project](https://github.com/RustCrypto)
- [WebAssembly Security](https://webassembly.org/docs/security/)

### Contact Information

- **Security Email**: wilsontran@ronus.io
- **General Contact**: wilsontran@ronus.io
- **GitHub**: https://github.com/wstran/cryptographer

---

*Last updated: 2024*
*This security policy is a living document and will be updated as needed.*