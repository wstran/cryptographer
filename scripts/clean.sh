SCRIPT_DIR=$(dirname "$(realpath "$0")")
mkdir -p "$SCRIPT_DIR/../packages"

# clean up the build artifacts and directories of the BLAKE3 WASM crate
rm -rf "$SCRIPT_DIR/../crates/blake3_wasm/target" "$SCRIPT_DIR/../crates/blake3_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/blake3_wasm"

# clean up the build artifacts and directories of the SHA2 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha2_wasm/target" "$SCRIPT_DIR/../crates/sha2_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/sha2_wasm"

# clean up the build artifacts and directories of the SHA3 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha3_wasm/target" "$SCRIPT_DIR/../crates/sha3_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/sha3_wasm"

# clean up the build artifacts and directories of the BLAKE2 WASM crate
rm -rf "$SCRIPT_DIR/../crates/blake2_wasm/target" "$SCRIPT_DIR/../crates/blake2_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/blake2_wasm"

# clean up the build artifacts and directories of the MD5 WASM crate
rm -rf "$SCRIPT_DIR/../crates/md5_wasm/target" "$SCRIPT_DIR/../crates/md5_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/md5_wasm"

# clean up the build artifacts and directories of the SHA1 WASM crate
rm -rf "$SCRIPT_DIR/../crates/sha1_wasm/target" "$SCRIPT_DIR/../crates/sha1_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/sha1_wasm"

# clean up the build artifacts and directories of the RIPEMD160 WASM crate
rm -rf "$SCRIPT_DIR/../crates/ripemd160_wasm/target" "$SCRIPT_DIR/../crates/ripemd160_wasm/Cargo.lock" "$SCRIPT_DIR/../packages/ripemd160_wasm"