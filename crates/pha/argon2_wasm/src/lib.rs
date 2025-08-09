use argon2::{Algorithm, Argon2, Params, PasswordHash, PasswordHasher, PasswordVerifier, Version};
use argon2::password_hash::SaltString;
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[derive(Deserialize)]
struct HashOptions {
    salt: Option<String>,
    #[serde(default)]
    time_cost: Option<u32>,
    #[serde(default)]
    memory_cost: Option<u32>,
    #[serde(default)]
    parallelism: Option<u32>,
    #[serde(default)]
    variant: Option<String>, // 'id' | 'i' | 'd' | 'argon2id' | ...
    #[serde(default)]
    key_length: Option<u32>,
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

    // Map algorithm variant
    let alg = match opts.variant.as_deref() {
        Some("i") | Some("argon2i") => Algorithm::Argon2i,
        Some("d") | Some("argon2d") => Algorithm::Argon2d,
        _ => Algorithm::Argon2id,
    };

    // Map parameters with sensible defaults
    let t_cost = opts.time_cost.unwrap_or(3);
    let m_cost = opts.memory_cost.unwrap_or(65536);
    let p = opts.parallelism.unwrap_or(4);
    let params = Params::new(
        m_cost,
        t_cost,
        p,
        Some(opts.key_length.unwrap_or(32) as usize),
    )
        .map_err(|e| JsValue::from_str(&format!("Invalid params: {}", e)))?;

    let argon2 = Argon2::new(alg, Version::V0x13, params);

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
