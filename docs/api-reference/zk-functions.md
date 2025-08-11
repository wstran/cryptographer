# ZK Functions

Synchronous Groth16 proof generation and verification using snarkjs under the hood.

## Overview

The ZK module provides a clean, synchronous API for Groth16 zk-SNARK operations. It internally handles all snarkjs operations using the current Node.js process, keeping the library self-contained and easy to use.

## Requirements

- The `snarkjs` package must be installed in the user's project (`npm install snarkjs`)
- All inputs must be provided as binary data (Buffer/Uint8Array)
- No external runner scripts or additional setup required

## API Reference

### generateProof(circuit, zkey, inputs, options?)

Generates a Groth16 proof.

**Parameters:**
- `circuit` (Buffer | Uint8Array): **Required** - The circuit WASM binary data
- `zkey` (Buffer | Uint8Array): **Required** - The proving key binary data
- `inputs` (Record<string, unknown>): **Required** - All circuit inputs (public and private)
- `options?` (GenerateProofOptions): Optional configuration
  - `timeout?` (number): Custom timeout in milliseconds (default: 300000)

**Returns:** `Groth16ProveResult` - Object containing `proof` and `publicSignals`

**Example:**
```javascript
const fs = require('fs');

const result = crypto.zk.groth16.generateProof(
  fs.readFileSync('./circuit.wasm'),
  fs.readFileSync('./proving_key.zkey'),
  { a: 123, b: 456 } // all input signals
);

console.log('Proof:', result.proof);
console.log('Public signals:', result.publicSignals);
```

### verifyProof(vkey, proof, publicSignals)

Verifies a Groth16 proof.

**Parameters:**
- `vkey` (Record<string, unknown>): **Required** - The verification key object
- `proof` (Record<string, unknown>): **Required** - The proof object to verify
- `publicSignals` (unknown[]): **Required** - The public signals array

**Returns:** `boolean` - `true` if verification succeeds, `false` otherwise

**Example:**
```javascript
const isValid = crypto.zk.groth16.verifyProof(
  verificationKey,
  proofObject,
  publicSignalsArray
);

console.log('Proof verification:', isValid ? 'SUCCESS' : 'FAILED');
```

### serializeProof(data, format?)

Serializes a proof result into various formats.

**Parameters:**
- `data` (Groth16ProveResult): The proof result object
- `format?` (Groth16SerializeFormat): Output format (default: 'buffer')

**Returns:** `Buffer | string` - Serialized proof data

**Formats:**
- `'buffer'`: Returns a Buffer
- `'base64'`: Returns a base64-encoded string
- `'hex'`: Returns a hex-encoded string
- `'json'`: Returns a JSON string

**Example:**
```javascript
const serialized = crypto.zk.groth16.serializeProof(result, 'base64');
console.log('Base64 proof:', serialized);

const hexProof = crypto.zk.groth16.serializeProof(result, 'hex');
console.log('Hex proof:', hexProof);
```

### deserializeProof(input)

Deserializes proof data back into a proof result object.

**Parameters:**
- `input` (Buffer | string): Serialized proof data (automatically detects format)

**Returns:** `Groth16ProveResult` - The reconstructed proof result

**Example:**
```javascript
const deserialized = crypto.zk.groth16.deserializeProof(serialized);
console.log('Reconstructed proof:', deserialized.proof);
console.log('Reconstructed signals:', deserialized.publicSignals);
```

## Internal Implementation

The library internally handles all snarkjs operations using the current Node.js process:

- **Proof Generation**: Uses `snarkjs.groth16.fullProve()` with temporary file management
- **Proof Verification**: Uses `snarkjs.groth16.verify()` with direct data passing
- **File Handling**: Automatically creates and cleans up temporary files
- **Error Handling**: Comprehensive error handling with timeout protection
- **Memory Management**: Efficient memory usage with automatic cleanup

## Complete Example

```javascript
const fs = require('fs');
const crypto = require('cryptographer.js');

// Load your circuit and keys
const circuit = fs.readFileSync('./circuit.wasm');
const zkey = fs.readFileSync('./proving_key.zkey');
const vkey = JSON.parse(fs.readFileSync('./verification_key.json', 'utf8'));

// Generate proof
const result = crypto.zk.groth16.generateProof(
  circuit,
  zkey,
  { a: 3, b: 11 } // all input signals
);

// Verify proof
const isValid = crypto.zk.groth16.verifyProof(
  vkey,
  result.proof,
  result.publicSignals
);

console.log('Verification result:', isValid);

// Serialize for storage/transmission
const serialized = crypto.zk.groth16.serializeProof(result, 'base64');
console.log('Serialized proof:', serialized);
```

## Notes

- All functions are synchronous and do not require `await`
- The library handles temporary file creation and cleanup automatically
- Timeout handling prevents hanging operations (default: 5 minutes)
- Input validation ensures data integrity
- No external runner scripts required - everything is self-contained
- Automatic memory management with efficient cleanup
- Support for both small (verify) and large (prove) data operations


