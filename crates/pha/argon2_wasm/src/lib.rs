use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::SaltString;
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[derive(Deserialize)]
struct HashOptions {
    salt: Option<String>,
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

    let salt = match opts.salt {
        Some(s) => SaltString::from_b64(&s)
            .map_err(|e| JsValue::from_str(&format!("Invalid salt: {}", e)))?,
        None => return Err(JsValue::from_str("Salt is required. Please generate in JS")),
    };

    let argon2 = Argon2::default();

    let hash = argon2
        .hash_password(password_bytes, &salt)
        .map_err(|e| JsValue::from_str(&format!("Hash error: {}", e)))?
        .to_string();

    Ok(hash)
}

#[wasm_bindgen]
pub fn verify_password(password: Uint8Array, hashed_password: String) -> Result<bool, JsValue> {
    let password_bytes = unsafe {
        std::slice::from_raw_parts(
            password.byte_offset() as *const u8,
            password.length() as usize,
        )
    };

    let parsed_hash = PasswordHash::new(&hashed_password)
        .map_err(|e| JsValue::from_str(&format!("Parse hash error: {}", e)))?;

    Ok(Argon2::default()
        .verify_password(password_bytes, &parsed_hash)
        .is_ok())
}
