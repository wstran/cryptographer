# Installation

## Version Information

This documentation covers **cryptographer.js**, the latest stable release with:

- ✅ **Production Ready** - Fully tested and optimized
- ✅ **TypeScript Support** - Complete type definitions
- ✅ **WebAssembly Modules** - High-performance Rust implementations
- ✅ **Comprehensive Coverage** - All major cryptographic algorithms

## Prerequisites

Before installing cryptographer.js, make sure you have:

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0

## Installation

### Using npm

```bash
npm install cryptographer.js
```

### Using yarn

```bash
yarn add cryptographer.js
```

### Using pnpm

```bash
pnpm add cryptographer.js
```

## Import Methods

### CommonJS

```javascript
const crypto = require('cryptographer.js');
```

### ES Modules

```javascript
import crypto from 'cryptographer.js';
```

### TypeScript

```typescript
import crypto, {
  CryptoInput,
  HashOptions,
  CipherOptions
} from 'cryptographer.js';
```

## Verification

To verify the installation, run this code:

```javascript
import crypto from 'cryptographer.js';

// Test hash function
const hash = crypto.sha.sha256('Hello World');
console.log('SHA-256:', hash);

// Test HMAC
const hmac = crypto.hmac.sha256('data', { key: 'secret' });
console.log('HMAC:', hmac);

// Test cipher
const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key: Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex'),
  iv: Buffer.from('0123456789abcdef0123456789abcdef', 'hex')
});
console.log('Encrypted:', encrypted);
```

## Platform Support

cryptographer.js supports the following platforms:

| Platform | Architecture | Status |
|----------|--------------|---------|
| Linux | x64, arm64 | ✅ Supported |
| macOS | x64, arm64 | ✅ Supported |
| Windows | x64 | ✅ Supported |

## Browser Support

⚠️ **Note**: cryptographer.js is designed for **Node.js** environments. Browser support is not a goal due to:

- WebAssembly threading limitations
- Node.js crypto bindings dependency
- Server-side optimization focus

## Troubleshooting

### Common Issues

#### 1. Module not found error

```bash
Error: Cannot find module 'cryptographer.js'
```

**Solution**: Make sure you've installed the package correctly:

```bash
npm install cryptographer.js
```

#### 2. WebAssembly loading error

```bash
Error: WebAssembly module failed to load
```

**Solution**: This usually indicates a platform compatibility issue. Check:

- Node.js version (>= 14.0.0)
- Platform architecture support
- File permissions

#### 3. TypeScript errors

```bash
Cannot find module 'cryptographer.js' or its corresponding type declarations
```

**Solution**: Install TypeScript types:

```bash
npm install --save-dev @types/node
```

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/wstran/cryptographer/issues)
2. Review the [Security Policy](https://github.com/wstran/cryptographer/blob/main/SECURITY.md)
3. Create a new issue with detailed information