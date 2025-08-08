use chacha20::ChaCha20;
use chacha20::cipher::{KeyIvInit, StreamCipher};
use chacha20poly1305::aead::{Aead, KeyInit};
use chacha20poly1305::{ChaCha20Poly1305, Nonce as AeadNonce};
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ChaCha20Algorithm {
    /// Raw ChaCha20 stream cipher (no authentication)
    Chacha20,
    /// ChaCha20-Poly1305 AEAD (authenticated encryption)
    Chacha20Poly1305,
}

#[wasm_bindgen]
pub fn encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    algo: ChaCha20Algorithm,
) -> Result<Uint8Array, JsValue> {
    let mut data = plaintext.to_vec();
    let key = key.to_vec();
    let nonce_vec = nonce.to_vec();

    match algo {
        ChaCha20Algorithm::Chacha20 => {
            if key.len() != 32 {
                return Err(JsValue::from_str("ChaCha20: key must be 32 bytes"));
            }
            if nonce_vec.len() != 12 {
                return Err(JsValue::from_str("ChaCha20: nonce must be 12 bytes"));
            }
            let mut cipher = ChaCha20::new_from_slices(&key, &nonce_vec)
                .map_err(|_| JsValue::from_str("Invalid ChaCha20 key/nonce"))?;
            cipher.apply_keystream(&mut data);
            Ok(Uint8Array::from(data.as_slice()))
        }
        ChaCha20Algorithm::Chacha20Poly1305 => {
            if key.len() != 32 {
                return Err(JsValue::from_str(
                    "ChaCha20-Poly1305: key must be 32 bytes",
                ));
            }
            if nonce_vec.len() != 12 {
                return Err(JsValue::from_str(
                    "ChaCha20-Poly1305: nonce must be 12 bytes",
                ));
            }
            let cipher = ChaCha20Poly1305::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid ChaCha20-Poly1305 key"))?;
            let ct = cipher
                .encrypt(AeadNonce::from_slice(&nonce_vec), data.as_ref())
                .map_err(|_| JsValue::from_str("AEAD encryption failed"))?;
            Ok(Uint8Array::from(ct.as_slice()))
        }
    }
}

#[wasm_bindgen]
pub fn decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    algo: ChaCha20Algorithm,
) -> Result<Uint8Array, JsValue> {
    let mut data = ciphertext.to_vec();
    let key = key.to_vec();
    let nonce_vec = nonce.to_vec();

    match algo {
        ChaCha20Algorithm::Chacha20 => {
            if key.len() != 32 {
                return Err(JsValue::from_str("ChaCha20: key must be 32 bytes"));
            }
            if nonce_vec.len() != 12 {
                return Err(JsValue::from_str("ChaCha20: nonce must be 12 bytes"));
            }
            let mut cipher = ChaCha20::new_from_slices(&key, &nonce_vec)
                .map_err(|_| JsValue::from_str("Invalid ChaCha20 key/nonce"))?;
            cipher.apply_keystream(&mut data);
            Ok(Uint8Array::from(data.as_slice()))
        }
        ChaCha20Algorithm::Chacha20Poly1305 => {
            if key.len() != 32 {
                return Err(JsValue::from_str(
                    "ChaCha20-Poly1305: key must be 32 bytes",
                ));
            }
            if nonce_vec.len() != 12 {
                return Err(JsValue::from_str(
                    "ChaCha20-Poly1305: nonce must be 12 bytes",
                ));
            }
            let cipher = ChaCha20Poly1305::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid ChaCha20-Poly1305 key"))?;
            let pt = cipher
                .decrypt(AeadNonce::from_slice(&nonce_vec), data.as_ref())
                .map_err(|_| JsValue::from_str("AEAD decryption failed or tag mismatch"))?;
            Ok(Uint8Array::from(pt.as_slice()))
        }
    }
}
