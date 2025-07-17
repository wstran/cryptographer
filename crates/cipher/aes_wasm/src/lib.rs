use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn aes_encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
) -> Result<Uint8Array, JsValue> {
    let key_bytes = key.to_vec();

    if key_bytes.len() != 32 {
        return Err(JsValue::from_str("Key must be 32 bytes for AES-256"));
    }

    let cipher =
        Aes256Gcm::new_from_slice(&key_bytes).map_err(|_| JsValue::from_str("Invalid key"))?;

    let nonce_bytes = nonce.to_vec();

    if nonce_bytes.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes for AES-GCM"));
    }

    let nonce = Nonce::from_slice(&nonce_bytes);

    let encrypted = cipher
        .encrypt(nonce, plaintext.to_vec().as_ref())
        .map_err(|_| JsValue::from_str("Encryption failed"))?;

    Ok(Uint8Array::from(encrypted.as_slice()))
}

#[wasm_bindgen]
pub fn aes_decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
) -> Result<Uint8Array, JsValue> {
    let key_bytes = key.to_vec();

    if key_bytes.len() != 32 {
        return Err(JsValue::from_str("Key must be 32 bytes for AES-256"));
    }

    let cipher =
        Aes256Gcm::new_from_slice(&key_bytes).map_err(|_| JsValue::from_str("Invalid key"))?;

    let nonce_bytes = nonce.to_vec();

    if nonce_bytes.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes for AES-GCM"));
    }

    let nonce = Nonce::from_slice(&nonce_bytes);

    let decrypted = cipher
        .decrypt(nonce, ciphertext.to_vec().as_ref())
        .map_err(|_| JsValue::from_str("Decryption failed"))?;

    Ok(Uint8Array::from(decrypted.as_slice()))
}
