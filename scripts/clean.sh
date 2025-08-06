SCRIPT_DIR=$(dirname "$(realpath "$0")")
mkdir -p "$SCRIPT_DIR/../packages"

# ------- SHA WASM -------

# clean up the build artifacts and directories of the BLAKE2 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/blake2_wasm/target" "$SCRIPT_DIR/../crates/sha/blake2_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/blake2_wasm"

# clean up the build artifacts and directories of the BLAKE3 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/blake3_wasm/target" "$SCRIPT_DIR/../crates/sha/blake3_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/blake3_wasm"

# clean up the build artifacts and directories of the MD4 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/md4_wasm/target" "$SCRIPT_DIR/../crates/sha/md4_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/md4_wasm"

# clean up the build artifacts and directories of the MD5 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/md5_wasm/target" "$SCRIPT_DIR/../crates/sha/md5_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/md5_wasm"

# clean up the build artifacts and directories of the RIPEMD160 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/ripemd160_wasm/target" "$SCRIPT_DIR/../crates/sha/ripemd160_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/ripemd160_wasm"

# clean up the build artifacts and directories of the SHA1 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/sha1_wasm/target" "$SCRIPT_DIR/../crates/sha/sha1_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/sha1_wasm"

# clean up the build artifacts and directories of the SHA2 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/sha2_wasm/target" "$SCRIPT_DIR/../crates/sha/sha2_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/sha2_wasm"

# clean up the build artifacts and directories of the SHA3 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/sha3_wasm/target" "$SCRIPT_DIR/../crates/sha/sha3_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/sha3_wasm"

# clean up the build artifacts and directories of the WHIRLPOOL WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha/whirlpool_wasm/target" "$SCRIPT_DIR/../crates/sha/whirlpool_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/sha/whirlpool_wasm"

# ------- HMAC WASM -------

# clean up the build artifacts and directories of the HMAC WASM crate
rm -rf "$SCRIPT_DIR/../crates/hmac/hmac_wasm/target" "$SCRIPT_DIR/../crates/hmac/hmac_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/hmac/hmac_wasm"

# ------- PHA WASM -------

# clean up the build artifacts and directories of the BCRYPT WASM crate
rm -rf "$SCRIPT_DIR/../crates/pha/bcrypt_wasm/target" "$SCRIPT_DIR/../crates/pha/bcrypt_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/pha/bcrypt_wasm"

# clean up the build artifacts and directories of the ARGON2 WASM crate
rm -rf "$SCRIPT_DIR/../crates/pha/argon2_wasm/target" "$SCRIPT_DIR/../crates/pha/argon2_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/pha/argon2_wasm"

# clean up the build artifacts and directories of the PBKDF2 WASM crate
rm -rf "$SCRIPT_DIR/../crates/pha/pbkdf2_wasm/target" "$SCRIPT_DIR/../crates/pha/pbkdf2_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/pha/pbkdf2_wasm"

# ------- CIPHER WASM -------

# clean up the build artifacts and directories of the AES WASM crate
rm -rf "$SCRIPT_DIR/../crates/cipher/aes_wasm/target" "$SCRIPT_DIR/../crates/cipher/aes_wasm/Cargo.lock" "$SCRIPT_DIR/../wasm_packages/cipher/aes_wasm"
