#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(dirname "$(realpath "$0")")
ROOT_DIR="$SCRIPT_DIR/.."
DIST_DIR="$ROOT_DIR/dist"
PKG_DIR="$ROOT_DIR/packages"

copy_crate() {
  local src_dir="$1"
  local dst_dir="$2"
  mkdir -p "$dst_dir"
  # Copy only runtime artifacts
  cp -f "$src_dir"/*.js "$dst_dir" 2>/dev/null || true
  cp -f "$src_dir"/*.wasm "$dst_dir" 2>/dev/null || true
  cp -f "$src_dir"/*.d.ts "$dst_dir" 2>/dev/null || true
}

# SHA
for name in blake2_wasm blake3_wasm md4_wasm md5_wasm ripemd160_wasm sha1_wasm sha2_wasm sha3_wasm whirlpool_wasm; do
  copy_crate "$PKG_DIR/sha/$name" "$DIST_DIR/sha/$name"
done

# HMAC
copy_crate "$PKG_DIR/hmac/hmac_wasm" "$DIST_DIR/hmac/hmac_wasm"

# PHA
for name in argon2_wasm bcrypt_wasm pbkdf2_wasm; do
  copy_crate "$PKG_DIR/pha/$name" "$DIST_DIR/pha/$name"
done

# CIPHER
copy_crate "$PKG_DIR/cipher/aes_wasm" "$DIST_DIR/cipher/aes_wasm"

echo "Copied WASM artifacts into dist/* layout."


