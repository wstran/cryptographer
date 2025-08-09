#!/bin/bash
export PATH="$HOME/.cargo/bin:$PATH"
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
SCRIPT_DIR=$(dirname "$(realpath "$0")")
mkdir -p "$SCRIPT_DIR/../packages"

####### SHA #######

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

####### HMAC #######

# ------- HMAC WASM -------
CRATE_NAME="hmac_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/hmac/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/hmac/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

####### PHA #######

# ------- BCRYPT WASM -------
CRATE_NAME="bcrypt_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/pha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/pha/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- ARGON2 WASM -------
CRATE_NAME="argon2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/pha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/pha/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- PBKDF2 WASM -------
CRATE_NAME="pbkdf2_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/pha/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/pha/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

####### CIPHER #######

# ------- AES WASM -------
CRATE_NAME="aes_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/cipher/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/cipher/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- CHACHA20 WASM -------
CRATE_NAME="chacha20_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/cipher/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/cipher/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- DES/3DES WASM -------
CRATE_NAME="des_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/cipher/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/cipher/$CRATE_NAME"
wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- RSA-OAEP WASM -------
CRATE_NAME="rsa_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/cipher/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/cipher/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- X25519 WASM -------
CRATE_NAME="x25519_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/cipher/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/cipher/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- ECDH WASM -------
CRATE_NAME="ecdh_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/cipher/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/cipher/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

####### DSA #######

# ------- Ed25519 WASM -------
CRATE_NAME="ed25519_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/dsa/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/dsa/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- ECDSA WASM -------
CRATE_NAME="ecdsa_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/dsa/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/dsa/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm

# ------- RSA Sign WASM -------
CRATE_NAME="rsa_sign_wasm"
TARGET_DIR="$SCRIPT_DIR/../packages/dsa/$CRATE_NAME"

mkdir -p "$TARGET_DIR"

echo "Building WASM for $CRATE_NAME..."
cd "$SCRIPT_DIR/../crates/dsa/$CRATE_NAME"
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target nodejs --release --out-dir "$TARGET_DIR" -- --features wasm
