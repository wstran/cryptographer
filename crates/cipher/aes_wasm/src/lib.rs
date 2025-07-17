use aes::{Aes128, Aes192, Aes256};
use aes_gcm::aead::{Aead as GcmAead, KeyInit as GcmKeyInit};
use aes_gcm::{Aes128Gcm, Aes256Gcm, AesGcm, Nonce as GcmNonce};
use ccm::aead::Nonce;
use ccm::Ccm;
use ctr::cipher::{KeyIvInit, StreamCipher};
use js_sys::Uint8Array;
use serde::Deserialize;
use typenum::{U12, U13, U16};
use wasm_bindgen::prelude::*;

type Aes192Gcm = AesGcm<Aes192, U12>;

type Aes128Ctr = ctr::Ctr128BE<Aes128>;
type Aes192Ctr = ctr::Ctr128BE<Aes192>;
type Aes256Ctr = ctr::Ctr128BE<Aes256>;

type Aes128Ccm = Ccm<Aes128, U16, U13>;
type Aes192Ccm = Ccm<Aes192, U16, U13>;
type Aes256Ccm = Ccm<Aes256, U16, U13>;

#[wasm_bindgen]
#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum AesAlgorithm {
    Aes128Gcm,
    Aes192Gcm,
    Aes256Gcm,
    Aes128Ctr,
    Aes192Ctr,
    Aes256Ctr,
    Aes128Ccm,
    Aes192Ccm,
    Aes256Ccm,
}

#[wasm_bindgen]
pub fn encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce_or_iv: Uint8Array,
    algo: AesAlgorithm,
) -> Result<Uint8Array, JsValue> {
    let data = plaintext.to_vec();

    let key = key.to_vec();

    let nonce = nonce_or_iv.to_vec();

    match algo {
        AesAlgorithm::Aes128Gcm => {
            if key.len() != 16 || nonce.len() != 12 {
                return Err(JsValue::from_str(
                    "AES-128-GCM: key must be 16 bytes, nonce must be 12 bytes",
                ));
            }

            let cipher = Aes128Gcm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-128-GCM key"))?;

            let encrypted = cipher
                .encrypt(GcmNonce::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("GCM encryption failed"))?;

            Ok(Uint8Array::from(encrypted.as_slice()))
        }
        AesAlgorithm::Aes192Gcm => {
            if key.len() != 24 || nonce.len() != 12 {
                return Err(JsValue::from_str(
                    "AES-192-GCM: key must be 24 bytes, nonce must be 12 bytes",
                ));
            }

            let cipher = Aes192Gcm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-192-GCM key"))?;

            let encrypted = cipher
                .encrypt(GcmNonce::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("GCM encryption failed"))?;

            Ok(Uint8Array::from(encrypted.as_slice()))
        }
        AesAlgorithm::Aes256Gcm => {
            if key.len() != 32 || nonce.len() != 12 {
                return Err(JsValue::from_str(
                    "AES-256-GCM: key must be 32 bytes, nonce must be 12 bytes",
                ));
            }

            let cipher = Aes256Gcm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-256-GCM key"))?;

            let encrypted = cipher
                .encrypt(GcmNonce::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("GCM encryption failed"))?;

            Ok(Uint8Array::from(encrypted.as_slice()))
        }
        AesAlgorithm::Aes128Ctr => {
            if key.len() != 16 || nonce.len() != 16 {
                return Err(JsValue::from_str(
                    "AES-128-CTR: key and IV must be 16 bytes",
                ));
            }

            let mut cipher = Aes128Ctr::new_from_slices(&key, &nonce)
                .map_err(|_| JsValue::from_str("Invalid AES-128-CTR key/IV"))?;

            let mut data = data;

            cipher.apply_keystream(&mut data);

            Ok(Uint8Array::from(data.as_slice()))
        }
        AesAlgorithm::Aes192Ctr => {
            if key.len() != 24 || nonce.len() != 16 {
                return Err(JsValue::from_str(
                    "AES-192-CTR: key must be 24 bytes, IV must be 16 bytes",
                ));
            }

            let mut cipher = Aes192Ctr::new_from_slices(&key, &nonce)
                .map_err(|_| JsValue::from_str("Invalid AES-192-CTR key/IV"))?;

            let mut data = data;

            cipher.apply_keystream(&mut data);

            Ok(Uint8Array::from(data.as_slice()))
        }
        AesAlgorithm::Aes256Ctr => {
            if key.len() != 32 || nonce.len() != 16 {
                return Err(JsValue::from_str(
                    "AES-256-CTR: key must be 32 bytes, IV must be 16 bytes",
                ));
            }

            let mut cipher = Aes256Ctr::new_from_slices(&key, &nonce)
                .map_err(|_| JsValue::from_str("Invalid AES-256-CTR key/IV"))?;

            let mut data = data;
            
            cipher.apply_keystream(&mut data);

            Ok(Uint8Array::from(data.as_slice()))
        }
        AesAlgorithm::Aes128Ccm => {
            if key.len() != 16 || nonce.len() != 13 {
                return Err(JsValue::from_str(
                    "AES-128-CCM: key must be 16 bytes, nonce must be 13 bytes",
                ));
            }

            let cipher = Aes128Ccm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-128-CCM key"))?;

            let encrypted = cipher
                .encrypt(Nonce::<Aes128Ccm>::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("CCM encryption failed"))?;

            Ok(Uint8Array::from(encrypted.as_slice()))
        }
        AesAlgorithm::Aes192Ccm => {
            if key.len() != 24 || nonce.len() != 13 {
                return Err(JsValue::from_str(
                    "AES-192-CCM: key must be 24 bytes, nonce must be 13 bytes",
                ));
            }

            let cipher = Aes192Ccm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-192-CCM key"))?;

            let encrypted = cipher
                .encrypt(Nonce::<Aes192Ccm>::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("CCM encryption failed"))?;

            Ok(Uint8Array::from(encrypted.as_slice()))
        }
        AesAlgorithm::Aes256Ccm => {
            if key.len() != 32 || nonce.len() != 13 {
                return Err(JsValue::from_str(
                    "AES-256-CCM: key must be 32 bytes, nonce must be 13 bytes",
                ));
            }

            let cipher = Aes256Ccm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-256-CCM key"))?;

            let encrypted = cipher
                .encrypt(Nonce::<Aes256Ccm>::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("CCM encryption failed"))?;

            Ok(Uint8Array::from(encrypted.as_slice()))
        }
    }
}

#[wasm_bindgen]
pub fn decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce_or_iv: Uint8Array,
    algo: AesAlgorithm,
) -> Result<Uint8Array, JsValue> {
    let data = ciphertext.to_vec();

    let key = key.to_vec();

    let nonce = nonce_or_iv.to_vec();

    match algo {
        AesAlgorithm::Aes128Gcm => {
            if key.len() != 16 || nonce.len() != 12 {
                return Err(JsValue::from_str(
                    "AES-128-GCM: key must be 16 bytes, nonce must be 12 bytes",
                ));
            }

            let cipher = Aes128Gcm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-128-GCM key"))?;

            let decrypted = cipher
                .decrypt(GcmNonce::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("GCM decryption failed"))?;
            
            Ok(Uint8Array::from(decrypted.as_slice()))
        }
        AesAlgorithm::Aes192Gcm => {
            if key.len() != 24 || nonce.len() != 12 {
                return Err(JsValue::from_str(
                    "AES-192-GCM: key must be 24 bytes, nonce must be 12 bytes",
                ));
            }

            let cipher = Aes192Gcm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-192-GCM key"))?;

            let decrypted = cipher
                .decrypt(GcmNonce::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("GCM decryption failed"))?;

            Ok(Uint8Array::from(decrypted.as_slice()))
        }
        AesAlgorithm::Aes256Gcm => {
            if key.len() != 32 || nonce.len() != 12 {
                return Err(JsValue::from_str(
                    "AES-256-GCM: key must be 32 bytes, nonce must be 12 bytes",
                ));
            }

            let cipher = Aes256Gcm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-256-GCM key"))?;

            let decrypted = cipher
                .decrypt(GcmNonce::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("GCM decryption failed"))?;

            Ok(Uint8Array::from(decrypted.as_slice()))
        }
        AesAlgorithm::Aes128Ctr => {
            if key.len() != 16 || nonce.len() != 16 {
                return Err(JsValue::from_str(
                    "AES-128-CTR: key and IV must be 16 bytes",
                ));
            }

            let mut cipher = Aes128Ctr::new_from_slices(&key, &nonce)
                .map_err(|_| JsValue::from_str("Invalid AES-128-CTR key/IV"))?;

            let mut data = data;

            cipher.apply_keystream(&mut data);

            Ok(Uint8Array::from(data.as_slice()))
        }
        AesAlgorithm::Aes192Ctr => {
            if key.len() != 24 || nonce.len() != 16 {
                return Err(JsValue::from_str(
                    "AES-192-CTR: key must be 24 bytes, IV must be 16 bytes",
                ));
            }

            let mut cipher = Aes192Ctr::new_from_slices(&key, &nonce)
                .map_err(|_| JsValue::from_str("Invalid AES-192-CTR key/IV"))?;

            let mut data = data;

            cipher.apply_keystream(&mut data);

            Ok(Uint8Array::from(data.as_slice()))
        }
        AesAlgorithm::Aes256Ctr => {
            if key.len() != 32 || nonce.len() != 16 {
                return Err(JsValue::from_str(
                    "AES-256-CTR: key must be 32 bytes, IV must be 16 bytes",
                ));
            }

            let mut cipher = Aes256Ctr::new_from_slices(&key, &nonce)
                .map_err(|_| JsValue::from_str("Invalid AES-256-CTR key/IV"))?;

            let mut data = data;

            cipher.apply_keystream(&mut data);

            Ok(Uint8Array::from(data.as_slice()))
        }
        AesAlgorithm::Aes128Ccm => {
            if key.len() != 16 || nonce.len() != 13 {
                return Err(JsValue::from_str(
                    "AES-128-CCM: key must be 16 bytes, nonce must be 13 bytes",
                ));
            }

            let cipher = Aes128Ccm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-128-CCM key"))?;
            
            let decrypted = cipher
                .decrypt(Nonce::<Aes128Ccm>::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("CCM decryption failed"))?;

            Ok(Uint8Array::from(decrypted.as_slice()))
        }
        AesAlgorithm::Aes192Ccm => {
            if key.len() != 24 || nonce.len() != 13 {
                return Err(JsValue::from_str(
                    "AES-192-CCM: key must be 24 bytes, nonce must be 13 bytes",
                ));
            }

            let cipher = Aes192Ccm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-192-CCM key"))?;

            let decrypted = cipher
                .decrypt(Nonce::<Aes192Ccm>::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("CCM decryption failed"))?;

            Ok(Uint8Array::from(decrypted.as_slice()))
        }
        AesAlgorithm::Aes256Ccm => {
            if key.len() != 32 || nonce.len() != 13 {
                return Err(JsValue::from_str(
                    "AES-256-CCM: key must be 32 bytes, nonce must be 13 bytes",
                ));
            }

            let cipher = Aes256Ccm::new_from_slice(&key)
                .map_err(|_| JsValue::from_str("Invalid AES-256-CCM key"))?;

            let decrypted = cipher
                .decrypt(Nonce::<Aes256Ccm>::from_slice(&nonce), data.as_ref())
                .map_err(|_| JsValue::from_str("CCM decryption failed"))?;
            
            Ok(Uint8Array::from(decrypted.as_slice()))
        }
    }
}
