use js_sys::Uint8Array;
use rsa::{RsaPrivateKey, RsaPublicKey};
use rsa::pkcs1::{DecodeRsaPrivateKey, DecodeRsaPublicKey};
use rsa::pkcs8::{DecodePrivateKey, DecodePublicKey};
use rsa::pss::BlindedSigningKey as PssSigningKey;
use rsa::pkcs1v15::{SigningKey as Pkcs1v15SigningKey, VerifyingKey as Pkcs1v15VerifyingKey};
use rsa::pss::VerifyingKey as PssVerifyingKey;
use rsa::signature::{RandomizedSigner, Verifier, SignatureEncoding};
use sha2::{Sha256, Sha384, Sha512};
use wasm_bindgen::prelude::*;
use serde::Deserialize;

#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum HashAlg { Sha256, Sha384, Sha512 }

fn parse_public_key_der(der: &[u8]) -> Result<RsaPublicKey, JsValue> {
    if let Ok(pk) = RsaPublicKey::from_public_key_der(der) { return Ok(pk); }
    if let Ok(pk) = RsaPublicKey::from_pkcs1_der(der) { return Ok(pk); }
    Err(JsValue::from_str("Failed to parse RSA public key"))
}

fn parse_private_key_der(der: &[u8]) -> Result<RsaPrivateKey, JsValue> {
    if let Ok(sk) = RsaPrivateKey::from_pkcs8_der(der) { return Ok(sk); }
    if let Ok(sk) = RsaPrivateKey::from_pkcs1_der(der) { return Ok(sk); }
    Err(JsValue::from_str("Failed to parse RSA private key"))
}

#[wasm_bindgen]
pub fn rsa_pss_sign(private_key_der: Uint8Array, message: Uint8Array, hash: JsValue) -> Result<Uint8Array, JsValue> {
    let sk = parse_private_key_der(&private_key_der.to_vec())?;
    let which: HashAlg = serde_wasm_bindgen::from_value(hash)
        .map_err(|_| JsValue::from_str("Invalid hash algorithm"))?;
    let mut rng = rsa::rand_core::OsRng;
    let sig = match which {
        HashAlg::Sha256 => {
            let key = PssSigningKey::<Sha256>::new(sk);
            key.sign_with_rng(&mut rng, &message.to_vec())
        }
        HashAlg::Sha384 => {
            let key = PssSigningKey::<Sha384>::new(sk);
            key.sign_with_rng(&mut rng, &message.to_vec())
        }
        HashAlg::Sha512 => {
            let key = PssSigningKey::<Sha512>::new(sk);
            key.sign_with_rng(&mut rng, &message.to_vec())
        }
    };
    Ok(Uint8Array::from(sig.to_vec().as_slice()))
}

#[wasm_bindgen]
pub fn rsa_pss_verify(public_key_der: Uint8Array, message: Uint8Array, signature: Uint8Array, hash: JsValue) -> Result<bool, JsValue> {
    let pk = parse_public_key_der(&public_key_der.to_vec())?;
    let which: HashAlg = serde_wasm_bindgen::from_value(hash)
        .map_err(|_| JsValue::from_str("Invalid hash algorithm"))?;
    let ok = match which {
        HashAlg::Sha256 => {
            let vk = PssVerifyingKey::<Sha256>::new(pk);
            if let Ok(sig) = rsa::pss::Signature::try_from(signature.to_vec().as_slice()) {
                vk.verify(&message.to_vec(), &sig).is_ok()
            } else { false }
        }
        HashAlg::Sha384 => {
            let vk = PssVerifyingKey::<Sha384>::new(pk);
            if let Ok(sig) = rsa::pss::Signature::try_from(signature.to_vec().as_slice()) {
                vk.verify(&message.to_vec(), &sig).is_ok()
            } else { false }
        }
        HashAlg::Sha512 => {
            let vk = PssVerifyingKey::<Sha512>::new(pk);
            if let Ok(sig) = rsa::pss::Signature::try_from(signature.to_vec().as_slice()) {
                vk.verify(&message.to_vec(), &sig).is_ok()
            } else { false }
        }
    };
    Ok(ok)
}

#[wasm_bindgen]
pub fn rsa_pkcs1v15_sign(private_key_der: Uint8Array, message: Uint8Array, hash: JsValue) -> Result<Uint8Array, JsValue> {
    let sk = parse_private_key_der(&private_key_der.to_vec())?;
    let which: HashAlg = serde_wasm_bindgen::from_value(hash)
        .map_err(|_| JsValue::from_str("Invalid hash algorithm"))?;
    let mut rng = rsa::rand_core::OsRng;
    let sig = match which {
        HashAlg::Sha256 => {
            let key = Pkcs1v15SigningKey::<Sha256>::new(sk);
            key.sign_with_rng(&mut rng, &message.to_vec())
        }
        HashAlg::Sha384 => {
            let key = Pkcs1v15SigningKey::<Sha384>::new(sk);
            key.sign_with_rng(&mut rng, &message.to_vec())
        }
        HashAlg::Sha512 => {
            let key = Pkcs1v15SigningKey::<Sha512>::new(sk);
            key.sign_with_rng(&mut rng, &message.to_vec())
        }
    };
    Ok(Uint8Array::from(sig.to_vec().as_slice()))
}

#[wasm_bindgen]
pub fn rsa_pkcs1v15_verify(public_key_der: Uint8Array, message: Uint8Array, signature: Uint8Array, hash: JsValue) -> Result<bool, JsValue> {
    let pk = parse_public_key_der(&public_key_der.to_vec())?;
    let which: HashAlg = serde_wasm_bindgen::from_value(hash)
        .map_err(|_| JsValue::from_str("Invalid hash algorithm"))?;
    let ok = match which {
        HashAlg::Sha256 => {
            let vk = Pkcs1v15VerifyingKey::<Sha256>::new(pk);
            if let Ok(sig) = rsa::pkcs1v15::Signature::try_from(signature.to_vec().as_slice()) {
                vk.verify(&message.to_vec(), &sig).is_ok()
            } else { false }
        }
        HashAlg::Sha384 => {
            let vk = Pkcs1v15VerifyingKey::<Sha384>::new(pk);
            if let Ok(sig) = rsa::pkcs1v15::Signature::try_from(signature.to_vec().as_slice()) {
                vk.verify(&message.to_vec(), &sig).is_ok()
            } else { false }
        }
        HashAlg::Sha512 => {
            let vk = Pkcs1v15VerifyingKey::<Sha512>::new(pk);
            if let Ok(sig) = rsa::pkcs1v15::Signature::try_from(signature.to_vec().as_slice()) {
                vk.verify(&message.to_vec(), &sig).is_ok()
            } else { false }
        }
    };
    Ok(ok)
}


