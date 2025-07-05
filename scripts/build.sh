#!/bin/bash

# ------- Blake3 WASM -------
SCRIPT_DIR=$(dirname "$(realpath "$0")")
CRATE_NAME="blake3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/$CRATE_NAME"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR/wasm"

# Build WASM
echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR/wasm" -- --features wasm
cd "$SCRIPT_DIR/../.."

# Build NATIVE
echo "Building native for $CRATE_NAME..."
cargo build --release --lib --manifest-path "$SCRIPT_DIR/../crates/$CRATE_NAME/Cargo.toml"  --features rayon 

# Copy .dylib
mkdir -p "$TARGET_DIR/native"
cp "$SCRIPT_DIR/../crates/$CRATE_NAME/target/release/libblake3_wasm.dylib" "$TARGET_DIR/native/"
chmod +x "$TARGET_DIR/native/libblake3_wasm.dylib"

echo "Build completed. Files in $TARGET_DIR/native:"
ls "$TARGET_DIR/native"