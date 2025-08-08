use js_sys::Uint8Array;
use rsa::{Oaep, RsaPrivateKey, RsaPublicKey};
use rsa::traits::PublicKeyParts;
use serde::Deserialize;
use sha1::Sha1;
use sha2::{Sha256, Sha384, Sha512};
use rsa::pkcs1::{DecodeRsaPrivateKey, DecodeRsaPublicKey};
use rsa::pkcs8::{DecodePrivateKey, DecodePublicKey};
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum HashAlg {
    Sha1,
    Sha256,
    Sha384,
    Sha512,
}

fn parse_public_key_der(der: &[u8]) -> Result<RsaPublicKey, JsValue> {
    // Try SPKI first
    if let Ok(pk) = RsaPublicKey::from_public_key_der(der) {
        return Ok(pk);
    }
    // Try PKCS#1
    if let Ok(pk) = RsaPublicKey::from_pkcs1_der(der) {
        return Ok(pk);
    }
    Err(JsValue::from_str("Failed to parse RSA public key (SPKI or PKCS#1 DER)"))
}

fn parse_private_key_der(der: &[u8]) -> Result<RsaPrivateKey, JsValue> {
    // Try PKCS#8 first
    if let Ok(sk) = RsaPrivateKey::from_pkcs8_der(der) {
        return Ok(sk);
    }
    // Try PKCS#1
    if let Ok(sk) = RsaPrivateKey::from_pkcs1_der(der) {
        return Ok(sk);
    }
    Err(JsValue::from_str("Failed to parse RSA private key (PKCS#8 or PKCS#1 DER)"))
}

fn max_oaep_len(bits: usize, hash_len: usize) -> usize {
    // k - 2*hLen - 2
    let k = (bits + 7) / 8;
    k.saturating_sub(2 * hash_len + 2)
}

#[wasm_bindgen]
pub fn rsa_oaep_encrypt(
    plaintext: Uint8Array,
    public_key_der: Uint8Array,
    hash: JsValue,
    label: Option<Uint8Array>,
) -> Result<Uint8Array, JsValue> {
    let data = plaintext.to_vec();
    let pk_der = public_key_der.to_vec();
    let pk = parse_public_key_der(&pk_der)?;

    let hash_alg: HashAlg = serde_wasm_bindgen::from_value(hash)
        .map_err(|_| JsValue::from_str("Invalid hash algorithm"))?;

    match hash_alg {
        HashAlg::Sha1 => {
            if data.len() > max_oaep_len(pk.size() * 8, 20) {
                return Err(JsValue::from_str("Plaintext too long for RSA-OAEP-SHA1"));
            }
            let mut rng = rand_core::OsRng;
            let pad = if let Some(l) = label {
                let lv = l.to_vec();
                let s = std::str::from_utf8(&lv).unwrap_or("");
                Oaep::new_with_label::<Sha1, _>(s)
            } else {
                Oaep::new::<Sha1>()
            };
            let ct = pk
                .encrypt(&mut rng, pad, &data)
                .map_err(|_| JsValue::from_str("RSA-OAEP encryption failed"))?;
            Ok(Uint8Array::from(ct.as_slice()))
        }
        HashAlg::Sha256 => {
            if data.len() > max_oaep_len(pk.size() * 8, 32) {
                return Err(JsValue::from_str("Plaintext too long for RSA-OAEP-SHA256"));
            }
            let mut rng = rand_core::OsRng;
            let pad = if let Some(l) = label {
                let lv = l.to_vec();
                let s = std::str::from_utf8(&lv).unwrap_or("");
                Oaep::new_with_label::<Sha256, _>(s)
            } else {
                Oaep::new::<Sha256>()
            };
            let ct = pk
                .encrypt(&mut rng, pad, &data)
                .map_err(|_| JsValue::from_str("RSA-OAEP encryption failed"))?;
            Ok(Uint8Array::from(ct.as_slice()))
        }
        HashAlg::Sha384 => {
            if data.len() > max_oaep_len(pk.size() * 8, 48) {
                return Err(JsValue::from_str("Plaintext too long for RSA-OAEP-SHA384"));
            }
            let mut rng = rand_core::OsRng;
            let pad = if let Some(l) = label {
                let lv = l.to_vec();
                let s = std::str::from_utf8(&lv).unwrap_or("");
                Oaep::new_with_label::<Sha384, _>(s)
            } else {
                Oaep::new::<Sha384>()
            };
            let ct = pk
                .encrypt(&mut rng, pad, &data)
                .map_err(|_| JsValue::from_str("RSA-OAEP encryption failed"))?;
            Ok(Uint8Array::from(ct.as_slice()))
        }
        HashAlg::Sha512 => {
            if data.len() > max_oaep_len(pk.size() * 8, 64) {
                return Err(JsValue::from_str("Plaintext too long for RSA-OAEP-SHA512"));
            }
            let mut rng = rand_core::OsRng;
            let pad = if let Some(l) = label {
                let lv = l.to_vec();
                let s = std::str::from_utf8(&lv).unwrap_or("");
                Oaep::new_with_label::<Sha512, _>(s)
            } else {
                Oaep::new::<Sha512>()
            };
            let ct = pk
                .encrypt(&mut rng, pad, &data)
                .map_err(|_| JsValue::from_str("RSA-OAEP encryption failed"))?;
            Ok(Uint8Array::from(ct.as_slice()))
        }
    }
}

#[wasm_bindgen]
pub fn rsa_oaep_decrypt(
    ciphertext: Uint8Array,
    private_key_der: Uint8Array,
    hash: JsValue,
    label: Option<Uint8Array>,
) -> Result<Uint8Array, JsValue> {
    let ct = ciphertext.to_vec();
    let sk_der = private_key_der.to_vec();
    let sk = parse_private_key_der(&sk_der)?;

    let hash_alg: HashAlg = serde_wasm_bindgen::from_value(hash)
        .map_err(|_| JsValue::from_str("Invalid hash algorithm"))?;

    match hash_alg {
        HashAlg::Sha1 => {
            let pad = if let Some(l) = label { let lv = l.to_vec(); let s = std::str::from_utf8(&lv).unwrap_or(""); Oaep::new_with_label::<Sha1, _>(s) } else { Oaep::new::<Sha1>() };
            let pt = sk
                .decrypt(pad, &ct)
                .map_err(|_| JsValue::from_str("RSA-OAEP decryption failed"))?;
            Ok(Uint8Array::from(pt.as_slice()))
        }
        HashAlg::Sha256 => {
            let pad = if let Some(l) = label { let lv = l.to_vec(); let s = std::str::from_utf8(&lv).unwrap_or(""); Oaep::new_with_label::<Sha256, _>(s) } else { Oaep::new::<Sha256>() };
            let pt = sk
                .decrypt(pad, &ct)
                .map_err(|_| JsValue::from_str("RSA-OAEP decryption failed"))?;
            Ok(Uint8Array::from(pt.as_slice()))
        }
        HashAlg::Sha384 => {
            let pad = if let Some(l) = label { let lv = l.to_vec(); let s = std::str::from_utf8(&lv).unwrap_or(""); Oaep::new_with_label::<Sha384, _>(s) } else { Oaep::new::<Sha384>() };
            let pt = sk
                .decrypt(pad, &ct)
                .map_err(|_| JsValue::from_str("RSA-OAEP decryption failed"))?;
            Ok(Uint8Array::from(pt.as_slice()))
        }
        HashAlg::Sha512 => {
            let pad = if let Some(l) = label { let lv = l.to_vec(); let s = std::str::from_utf8(&lv).unwrap_or(""); Oaep::new_with_label::<Sha512, _>(s) } else { Oaep::new::<Sha512>() };
            let pt = sk
                .decrypt(pad, &ct)
                .map_err(|_| JsValue::from_str("RSA-OAEP decryption failed"))?;
            Ok(Uint8Array::from(pt.as_slice()))
        }
    }
}
