#!/bin/bash

# ------- Blake3 WASM -------
SCRIPT_DIR=$(dirname "$(realpath "$0")")
CRATE_NAME="blake3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Build WASM
echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
cd "$SCRIPT_DIR/../.."