#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")
mkdir -p "$SCRIPT_DIR/../packages"

# ------- BLAKE2 WASM -------
CRATE_NAME="blake2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- BLAKE3 WASM -------
CRATE_NAME="blake3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- MD4 WASM -------
CRATE_NAME="md4_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- MD5 WASM -------
CRATE_NAME="md5_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- RIPEMD160 WASM -------
CRATE_NAME="ripemd160_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- SHA1 WASM -------
CRATE_NAME="sha1_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- SHA2 WASM -------
CRATE_NAME="sha2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- SHA3 WASM -------
CRATE_NAME="sha3_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- WHIRLPOOL WASM -------
CRATE_NAME="whirlpool_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/sha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/sha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm