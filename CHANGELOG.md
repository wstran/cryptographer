# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release planning
- Documentation improvements
- CI/CD pipeline setup

## [1.0.0] - 2024-01-XX

### Added
- **Hash Functions**: SHA-1, SHA-2 (256, 512), SHA-3 (256, 512), MD4, MD5, BLAKE2b, BLAKE2s, BLAKE3, Whirlpool, RIPEMD-160
- **Cipher Functions**: AES encryption/decryption with multiple modes (CBC, ECB, CTR)
- **HMAC**: Support for SHA-1, SHA-256, SHA-512, MD5 based HMAC
- **Key Derivation Functions**: PBKDF2, Argon2 (i, d, id), bcrypt
- **High Performance**: WebAssembly implementations using Rust
- **TypeScript Support**: Full type definitions and IntelliSense support
- **Streaming API**: Support for streaming hash operations
- **Node.js Optimization**: Specifically optimized for server-side Node.js applications
- **Comprehensive Documentation**: API reference, examples, and tutorials
- **Benchmarking Suite**: Performance comparison tools
- **Security Features**: Industry-standard cryptographic implementations

### Security
- All cryptographic algorithms implement industry-standard specifications
- Memory-safe implementations using Rust
- Secure random number generation for salt and IV generation
- Protection against timing attacks where applicable

### Performance
- 8-10x faster than pure JavaScript implementations
- Optimized WebAssembly compilation with release flags
- Minimal memory footprint
- Efficient buffer handling

### Developer Experience
- Zero-configuration setup
- Comprehensive TypeScript definitions
- Extensive test coverage
- Clear error messages and validation
- IDE autocompletion support

[Unreleased]: https://github.com/wstran/cryptographer/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/wstran/cryptographer/releases/tag/v1.0.0