use base64::{engine::general_purpose, Engine as _};
use js_sys::Uint8Array;
use pbkdf2::pbkdf2_hmac;
use serde::Deserialize;
use sha2::Sha256;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[derive(Deserialize)]
struct HashOptions {
    salt: Option<String>,
    iterations: Option<u32>,
    key_length: Option<usize>,
}

#[wasm_bindgen]
pub fn hash_password(password: Uint8Array, options: JsValue) -> Result<String, JsValue> {
    let opts: HashOptions = serde_wasm_bindgen::from_value(options)
        .map_err(|e| JsValue::from_str(&format!("Invalid options: {}", e)))?;

    let password_bytes = unsafe {
        std::slice::from_raw_parts(
            password.byte_offset() as *const u8,
            password.length() as usize,
        )
    };

    let salt_bytes = match opts.salt {
        Some(s) => general_purpose::STANDARD
            .decode(s)
            .map_err(|e| JsValue::from_str(&format!("Invalid salt (base64): {}", e)))?,
        None => return Err(JsValue::from_str("Salt is required. Please generate in JS")),
    };

    let iterations = opts.iterations.unwrap_or(100_000);

    let key_length = opts.key_length.unwrap_or(32);

    let mut derived_key = vec![0u8; key_length];

    pbkdf2_hmac::<Sha256>(password_bytes, &salt_bytes, iterations, &mut derived_key);

    let encoded = general_purpose::STANDARD.encode(&derived_key);

    Ok(encoded)
}

#[wasm_bindgen]
pub fn verify_password(
    password: Uint8Array,
    encoded_hash: String,
    salt: String,
    iterations: u32,
) -> Result<bool, JsValue> {
    let password_bytes = unsafe {
        std::slice::from_raw_parts(
            password.byte_offset() as *const u8,
            password.length() as usize,
        )
    };

    let salt_bytes = general_purpose::STANDARD
        .decode(&salt)
        .map_err(|e| JsValue::from_str(&format!("Invalid salt: {}", e)))?;

    let expected_hash = general_purpose::STANDARD
        .decode(&encoded_hash)
        .map_err(|e| JsValue::from_str(&format!("Invalid encoded hash: {}", e)))?;

    let mut derived_key = vec![0u8; expected_hash.len()];
    
    pbkdf2_hmac::<Sha256>(password_bytes, &salt_bytes, iterations, &mut derived_key);

    Ok(derived_key == expected_hash)
}
