#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")
mkdir -p "$SCRIPT_DIR/../packages"

# ------- BLAKE3 WASM -------
CRATE_NAME="blake3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."

# ------- SHA2 WASM -------
CRATE_NAME="sha2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."

# ------- SHA3 WASM -------
CRATE_NAME="sha3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."

#------- BLAKE2 WASM -------
CRATE_NAME="blake2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."