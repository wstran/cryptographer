use aes::Aes192;
use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes128Gcm, Aes256Gcm, AesGcm, Nonce};
use js_sys::Uint8Array;
use serde::Deserialize;
use typenum::U12;
use wasm_bindgen::prelude::*;

type Aes192Gcm = AesGcm<Aes192, U12>;

#[wasm_bindgen]
#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum AesAlgorithm {
    Aes128Gcm,
    Aes192Gcm,
    Aes256Gcm,
}

#[wasm_bindgen]
pub fn aes_encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    algo: AesAlgorithm,
) -> Result<Uint8Array, JsValue> {
    let key_bytes = key.to_vec();
    let nonce_bytes = nonce.to_vec();

    if nonce_bytes.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes for AES-GCM"));
    }

    let nonce = Nonce::from_slice(&nonce_bytes);

    let encrypted = match algo {
        AesAlgorithm::Aes128Gcm => {
            if key_bytes.len() != 16 {
                return Err(JsValue::from_str("Key must be 16 bytes for AES-128"));
            }

            let cipher = Aes128Gcm::new_from_slice(&key_bytes)
                .map_err(|_| JsValue::from_str("Invalid key for AES-128"))?;

            cipher
                .encrypt(nonce, plaintext.to_vec().as_ref())
                .map_err(|_| JsValue::from_str("Encryption failed"))
        }
        AesAlgorithm::Aes192Gcm => {
            if key_bytes.len() != 24 {
                return Err(JsValue::from_str("Key must be 24 bytes for AES-192"));
            }

            let cipher = Aes192Gcm::new_from_slice(&key_bytes)
                .map_err(|_| JsValue::from_str("Invalid key for AES-192"))?;

            cipher
                .encrypt(nonce, plaintext.to_vec().as_ref())
                .map_err(|_| JsValue::from_str("Encryption failed"))
        }
        AesAlgorithm::Aes256Gcm => {
            if key_bytes.len() != 32 {
                return Err(JsValue::from_str("Key must be 32 bytes for AES-256"));
            }

            let cipher = Aes256Gcm::new_from_slice(&key_bytes)
                .map_err(|_| JsValue::from_str("Invalid key for AES-256"))?;

            cipher
                .encrypt(nonce, plaintext.to_vec().as_ref())
                .map_err(|_| JsValue::from_str("Encryption failed"))
        }
    }?;

    Ok(Uint8Array::from(encrypted.as_slice()))
}

#[wasm_bindgen]
pub fn aes_decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    algo: AesAlgorithm,
) -> Result<Uint8Array, JsValue> {
    let key_bytes = key.to_vec();
    let nonce_bytes = nonce.to_vec();

    if nonce_bytes.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes for AES-GCM"));
    }

    let nonce = Nonce::from_slice(&nonce_bytes);

    let decrypted = match algo {
        AesAlgorithm::Aes128Gcm => {
            if key_bytes.len() != 16 {
                return Err(JsValue::from_str("Key must be 16 bytes for AES-128"));
            }

            let cipher = Aes128Gcm::new_from_slice(&key_bytes)
                .map_err(|_| JsValue::from_str("Invalid key for AES-128"))?;

            cipher
                .decrypt(nonce, ciphertext.to_vec().as_ref())
                .map_err(|_| JsValue::from_str("Decryption failed"))
        }
        AesAlgorithm::Aes192Gcm => {
            if key_bytes.len() != 24 {
                return Err(JsValue::from_str("Key must be 24 bytes for AES-192"));
            }

            let cipher = Aes192Gcm::new_from_slice(&key_bytes)
                .map_err(|_| JsValue::from_str("Invalid key for AES-192"))?;

            cipher
                .decrypt(nonce, ciphertext.to_vec().as_ref())
                .map_err(|_| JsValue::from_str("Decryption failed"))
        }
        AesAlgorithm::Aes256Gcm => {
            if key_bytes.len() != 32 {
                return Err(JsValue::from_str("Key must be 32 bytes for AES-256"));
            }

            let cipher = Aes256Gcm::new_from_slice(&key_bytes)
                .map_err(|_| JsValue::from_str("Invalid key for AES-256"))?;

            cipher
                .decrypt(nonce, ciphertext.to_vec().as_ref())
                .map_err(|_| JsValue::from_str("Decryption failed"))
        }
    }?;

    Ok(Uint8Array::from(decrypted.as_slice()))
}
