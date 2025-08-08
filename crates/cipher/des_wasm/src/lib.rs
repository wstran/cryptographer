use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

use des::Des;
use des::TdesEde3;
use ctr::cipher::{KeyIvInit, StreamCipher};
use cbc::cipher::{block_padding::Pkcs7, BlockDecryptMut, BlockEncryptMut};

// Type aliases for CBC mode
// DES uses 8-byte block and 8-byte IV
// 3DES uses 8-byte block and 8-byte IV, 24-byte key

type DesCbc = cbc::Encryptor<Des>;
type DesCbcDec = cbc::Decryptor<Des>;

type TdesCbc = cbc::Encryptor<TdesEde3>;
type TdesCbcDec = cbc::Decryptor<TdesEde3>;

// CTR (big-endian) for DES/3DES
// Note: RustCrypto provides Ctr64BE for 64-bit block ciphers via ctr crate
use ctr::Ctr64BE;
type DesCtr = Ctr64BE<Des>;
type TdesCtr = Ctr64BE<TdesEde3>;

#[wasm_bindgen]
#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum DesAlgorithm {
    /// DES in CBC mode with PKCS7 padding
    DesCbc,
    /// 3DES (EDE3) in CBC mode with PKCS7 padding
    TdesCbc,
    /// DES in CTR mode (no padding)
    DesCtr,
    /// 3DES (EDE3) in CTR mode (no padding)
    TdesCtr,
}

#[inline]
fn require_len(actual: usize, expected: usize, what: &str) -> Result<(), JsValue> {
    if actual != expected {
        Err(JsValue::from_str(&format!(
            "{} must be {} bytes (got {})",
            what, expected, actual
        )))
    } else {
        Ok(())
    }
}

#[wasm_bindgen]
pub fn encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
    algo: DesAlgorithm,
) -> Result<Uint8Array, JsValue> {
    let mut data = plaintext.to_vec();
    let key = key.to_vec();
    let iv_vec = iv.to_vec();

    match algo {
        DesAlgorithm::DesCbc => {
            require_len(key.len(), 8, "DES key")?;
            require_len(iv_vec.len(), 8, "DES IV")?;
            // CBC with PKCS7
            let enc = DesCbc::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid DES key/IV"))?;
            let ciphertext = enc
                .encrypt_padded_vec_mut::<Pkcs7>(&data);
            Ok(Uint8Array::from(ciphertext.as_slice()))
        }
        DesAlgorithm::TdesCbc => {
            require_len(key.len(), 24, "3DES key (EDE3)")?;
            require_len(iv_vec.len(), 8, "3DES IV")?;
            let enc = TdesCbc::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid 3DES key/IV"))?;
            let ciphertext = enc
                .encrypt_padded_vec_mut::<Pkcs7>(&data);
            Ok(Uint8Array::from(ciphertext.as_slice()))
        }
        DesAlgorithm::DesCtr => {
            require_len(key.len(), 8, "DES key")?;
            require_len(iv_vec.len(), 8, "DES CTR IV/nonce")?;
            let mut cipher = DesCtr::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid DES CTR key/IV"))?;
            cipher.apply_keystream(&mut data);
            Ok(Uint8Array::from(data.as_slice()))
        }
        DesAlgorithm::TdesCtr => {
            require_len(key.len(), 24, "3DES key (EDE3)")?;
            require_len(iv_vec.len(), 8, "3DES CTR IV/nonce")?;
            let mut cipher = TdesCtr::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid 3DES CTR key/IV"))?;
            cipher.apply_keystream(&mut data);
            Ok(Uint8Array::from(data.as_slice()))
        }
    }
}

#[wasm_bindgen]
pub fn decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
    algo: DesAlgorithm,
) -> Result<Uint8Array, JsValue> {
    let mut data = ciphertext.to_vec();
    let key = key.to_vec();
    let iv_vec = iv.to_vec();

    match algo {
        DesAlgorithm::DesCbc => {
            require_len(key.len(), 8, "DES key")?;
            require_len(iv_vec.len(), 8, "DES IV")?;
            let dec = DesCbcDec::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid DES key/IV"))?;
            let plaintext = dec
                .decrypt_padded_vec_mut::<Pkcs7>(&data)
                .map_err(|_| JsValue::from_str("DES CBC padding error or invalid data"))?;
            Ok(Uint8Array::from(plaintext.as_slice()))
        }
        DesAlgorithm::TdesCbc => {
            require_len(key.len(), 24, "3DES key (EDE3)")?;
            require_len(iv_vec.len(), 8, "3DES IV")?;
            let dec = TdesCbcDec::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid 3DES key/IV"))?;
            let plaintext = dec
                .decrypt_padded_vec_mut::<Pkcs7>(&data)
                .map_err(|_| JsValue::from_str("3DES CBC padding error or invalid data"))?;
            Ok(Uint8Array::from(plaintext.as_slice()))
        }
        DesAlgorithm::DesCtr => {
            require_len(key.len(), 8, "DES key")?;
            require_len(iv_vec.len(), 8, "DES CTR IV/nonce")?;
            let mut cipher = DesCtr::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid DES CTR key/IV"))?;
            cipher.apply_keystream(&mut data);
            Ok(Uint8Array::from(data.as_slice()))
        }
        DesAlgorithm::TdesCtr => {
            require_len(key.len(), 24, "3DES key (EDE3)")?;
            require_len(iv_vec.len(), 8, "3DES CTR IV/nonce")?;
            let mut cipher = TdesCtr::new_from_slices(&key, &iv_vec)
                .map_err(|_| JsValue::from_str("Invalid 3DES CTR key/IV"))?;
            cipher.apply_keystream(&mut data);
            Ok(Uint8Array::from(data.as_slice()))
        }
    }
}
