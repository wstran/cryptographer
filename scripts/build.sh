#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")

# ------- BLAKE3 WASM -------
CRATE_NAME="blake3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Build WASM
echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."

# ------- SHA2 WASM -------
CRATE_NAME="sha2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Build WASM
echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."