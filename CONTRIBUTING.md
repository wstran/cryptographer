# Contributing to cryptographer.js

First off, thank you for considering contributing to cryptographer.js! It's people like you that make this library great.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Rust (latest stable version)
- wasm-pack

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/cryptographer.git
   cd cryptographer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Rust and wasm-pack**
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install wasm-pack
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Run benchmarks**
   ```bash
   npm run benchmark
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find that you don't need to create one. When creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include Node.js version, npm version, and OS information**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Explain why this enhancement would be useful**
- **Consider performance implications**

### Contributing Code

#### Types of Contributions Welcome

1. **Bug fixes**
2. **Performance improvements**
3. **New cryptographic algorithms**
4. **Documentation improvements**
5. **Test coverage improvements**
6. **Example code and tutorials**

#### Adding New Algorithms

When adding new cryptographic algorithms:

1. **Create a new Rust crate** in the appropriate directory (`crates/cipher/`, `crates/sha/`, etc.)
2. **Implement the algorithm** using established Rust cryptography crates when possible
3. **Add WebAssembly bindings** following existing patterns
4. **Update the build script** to include the new crate
5. **Add TypeScript bindings** in the appropriate `src/` directory
6. **Write comprehensive tests**
7. **Add benchmarks** for performance tracking
8. **Update documentation**

## Style Guidelines

### TypeScript Style Guide

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Use meaningful variable and function names
- Add JSDoc comments for all public APIs
- Prefer explicit types over `any`

### Rust Style Guide

- Follow standard Rust formatting (`cargo fmt`)
- Use `clippy` lints (`cargo clippy`)
- Add comprehensive documentation comments (`///`)
- Follow Rust naming conventions
- Use established cryptography crates when possible

### Documentation Style

- Use clear, concise language
- Provide code examples for all APIs
- Include performance characteristics
- Document security considerations
- Keep examples up-to-date

## Commit Guidelines

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Examples

```
feat(cipher): add ChaCha20 encryption support
fix(hash): resolve SHA-3 padding issue
docs(api): add examples for HMAC functions
perf(wasm): optimize memory allocation in AES
```

## Pull Request Process

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the style guidelines

3. **Add or update tests** to cover your changes

4. **Run the full test suite**
   ```bash
   npm run validate
   ```

5. **Update documentation** if needed

6. **Commit your changes** using conventional commit format

7. **Push to your fork** and create a pull request

8. **Fill out the pull request template** completely

### Pull Request Requirements

- All tests must pass
- Code coverage must not decrease
- Performance benchmarks should not regress significantly
- Documentation must be updated for API changes
- Security implications must be considered and documented

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for all new functions
- Include edge cases and error conditions
- Test with various input types (string, Buffer, Uint8Array)
- Verify output formats and encodings
- Test performance characteristics for critical paths

### Test Structure

```typescript
describe('Algorithm Name', () => {
  describe('basic functionality', () => {
    it('should hash input correctly', () => {
      // Test implementation
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      // Test implementation
    });
  });

  describe('performance', () => {
    it('should meet performance requirements', () => {
      // Performance test
    });
  });
});
```

## Performance Considerations

- All cryptographic operations should be benchmarked
- WebAssembly implementations should be significantly faster than pure JS
- Memory usage should be minimized
- Avoid unnecessary data copying
- Consider streaming APIs for large inputs

## Security Considerations

- Use established cryptographic libraries in Rust implementations
- Follow cryptographic best practices
- Avoid implementing cryptographic primitives from scratch
- Consider timing attack resistance
- Document security assumptions and limitations
- Never commit test keys or sensitive data

### Security Review Process

All cryptographic code changes require:

1. **Self-review** for obvious security issues
2. **Peer review** by at least one other contributor
3. **Documentation** of security implications
4. **Testing** with known test vectors when available

## Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and help
- **Email**: wilsontran@ronus.io for security-related issues

## Recognition

Contributors will be recognized in:

- `package.json` contributors field
- Release notes for significant contributions
- `CONTRIBUTORS.md` file (if created)

Thank you for contributing to cryptographer.js! 🔐