use bcrypt::{hash, verify, DEFAULT_COST};
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[derive(Deserialize)]
struct HashOptions {
    cost: Option<u32>,
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

    let password_str = String::from_utf8(password_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Invalid password: {}", e)))?;

    hash(&password_str, opts.cost.unwrap_or(DEFAULT_COST))
        .map_err(|e| JsValue::from_str(&format!("Error hashing password: {}", e)))
}

#[wasm_bindgen]
pub fn verify_password(password: Uint8Array, hashed_password: String) -> Result<bool, JsValue> {
    let password_bytes = unsafe {
        std::slice::from_raw_parts(
            password.byte_offset() as *const u8,
            password.length() as usize,
        )
    };

    let password_str = String::from_utf8(password_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Invalid password: {}", e)))?;

    verify(&password_str, &hashed_password)
        .map_err(|e| JsValue::from_str(&format!("Error verifying password: {}", e)))
}