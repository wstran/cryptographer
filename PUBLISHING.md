# Publishing cryptographer.js to npm

## Prerequisites

1. **Install Rust and Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

2. **Install wasm-pack**
   ```bash
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

3. **Verify installations**
   ```bash
   rustc --version
   cargo --version
   wasm-pack --version
   ```

## Build Process

1. **Clean previous builds**
   ```bash
   npm run clean
   ```

2. **Build WASM modules**
   ```bash
   npm run build:wasm
   ```
   This will compile all Rust crates to WebAssembly and place them in the `packages/` directory.

3. **Build TypeScript**
   ```bash
   npm run build:ts
   ```
   This compiles TypeScript files and generates type definitions in the `dist/` directory.

4. **Copy type definitions**
   ```bash
   cp -r src/types dist/
   echo '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });' > dist/types/index.js
   ```

## Testing

1. **Run the demo**
   ```bash
   node demo.js
   ```

2. **Run benchmarks** (requires Bun)
   ```bash
   cd benchmark
   bun install
   bun run index.ts
   ```

## Publishing to npm

1. **Login to npm**
   ```bash
   npm login
   ```

2. **Update version** (if needed)
   ```bash
   npm version patch  # or minor/major
   ```

3. **Publish**
   ```bash
   npm publish
   ```
   
   Or use the automated script:
   ```bash
   npm run prepublishOnly  # This runs clean and build automatically
   npm publish
   ```

## Post-publish

1. **Verify installation**
   ```bash
   # In a new directory
   npm init -y
   npm install cryptographer.js
   ```

2. **Test the published package**
   ```javascript
   const crypto = require('cryptographer.js');
   
   // Test hash
   console.log(crypto.hash.sha256('Hello World'));
   
   // Test HMAC
   console.log(crypto.hmac.sha256('data', { key: 'secret' }));
   ```

## Troubleshooting

### WASM build fails
- Ensure Rust toolchain is up to date: `rustup update`
- Check that all Rust dependencies are installed
- Verify wasm-pack is installed correctly

### TypeScript build fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npx tsc --noEmit`

### Module not found errors
- Ensure all WASM modules are built before publishing
- Verify `packages/` directory contains all built modules
- Check that `dist/types/index.js` exists

## Version Management

Follow semantic versioning:
- **Patch** (x.x.X): Bug fixes, documentation updates
- **Minor** (x.X.x): New features, backward compatible
- **Major** (X.x.x): Breaking changes

## Security Considerations

1. Always test thoroughly before publishing
2. Use npm 2FA for publishing
3. Review all dependencies for vulnerabilities: `npm audit`
4. Sign your commits with GPG

## Maintenance

1. Keep dependencies updated
2. Monitor GitHub issues and pull requests
3. Regularly run benchmarks to ensure performance
4. Update documentation with API changes