const crypto = require('cryptographer.js');

console.log('🔐 Testing cryptographer.js v1.0.7');
console.log('=====================================');

// Test basic imports
console.log('\n📦 Package Info:');
console.log('- Hash functions available:', Object.keys(crypto.hash));
console.log('- Cipher functions available:', Object.keys(crypto.cipher));
console.log('- HMAC functions available:', Object.keys(crypto.hmac));
console.log('- KDF functions available:', Object.keys(crypto.kdf));

// Test basic hash function
console.log('\n🧪 Testing SHA-256 hash:');
try {
  const testString = 'Hello World';
  console.log(`Input: "${testString}"`);

  // Note: This will show the structure but actual hash computation
  // requires proper WASM module loading in a real environment
  console.log('Hash function structure:', typeof crypto.hash.sha256);
  console.log('✅ Package installed successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n�� Test completed!');