#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need path fixes
const filesToFix = [
  'dist/hash/index.js',
  'dist/hmac/index.js',
  'dist/cipher/index.js',
  'dist/kdf/index.js'
];

console.log('🔧 Fixing WASM module paths...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace relative paths to wasm_packages
    // From: '../wasm_packages/' (from src/)
    // To: '../../wasm_packages/' (from dist/)
    content = content.replace(
      /require\(['"]\.\.\/wasm_packages\//g,
      "require('../../wasm_packages/"
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed paths in ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('🎉 WASM path fixes completed!');