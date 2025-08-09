use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use rand_core::OsRng;
use serde::Deserialize;
use p256::ecdsa::signature::hazmat::{PrehashSigner as P256PrehashSigner, PrehashVerifier as P256PrehashVerifier};
use k256::ecdsa::signature::hazmat::{PrehashSigner as K256PrehashSigner, PrehashVerifier as K256PrehashVerifier};

#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Curve {
    P256,
    Secp256k1,
}

#[wasm_bindgen]
pub fn ecdsa_generate_keypair(curve: JsValue) -> Result<js_sys::Array, JsValue> {
    let which: Curve = serde_wasm_bindgen::from_value(curve)
        .map_err(|_| JsValue::from_str("Invalid curve"))?;
    match which {
        Curve::P256 => {
            use p256::ecdsa::{SigningKey, VerifyingKey};
            let sk = SigningKey::random(&mut OsRng);
            let vk: VerifyingKey = *sk.verifying_key();
            let arr = js_sys::Array::new();
            arr.push(&Uint8Array::from(sk.to_bytes().as_slice()));
            arr.push(&Uint8Array::from(vk.to_encoded_point(false).as_bytes()));
            Ok(arr)
        }
        Curve::Secp256k1 => {
            use k256::ecdsa::{SigningKey, VerifyingKey};
            let sk = SigningKey::random(&mut OsRng);
            let vk: VerifyingKey = *sk.verifying_key();
            let arr = js_sys::Array::new();
            arr.push(&Uint8Array::from(sk.to_bytes().as_slice()));
            arr.push(&Uint8Array::from(vk.to_encoded_point(false).as_bytes()));
            Ok(arr)
        }
    }
}

#[wasm_bindgen]
pub fn ecdsa_sign(curve: JsValue, private_key: Uint8Array, message_hash32: Uint8Array) -> Result<Uint8Array, JsValue> {
    let which: Curve = serde_wasm_bindgen::from_value(curve)
        .map_err(|_| JsValue::from_str("Invalid curve"))?;
    let pk = private_key.to_vec();
    let m = message_hash32.to_vec();
    if m.len() != 32 { return Err(JsValue::from_str("ECDSA sign expects 32-byte message hash")); }
    match which {
        Curve::P256 => {
            use p256::ecdsa::{Signature, SigningKey};
            let fb_key = p256::FieldBytes::from_slice(&pk);
            let sk = SigningKey::from_bytes(fb_key).map_err(|_| JsValue::from_str("Invalid P-256 private key"))?;
            let fb = p256::FieldBytes::from_slice(&m);
            let sig: Signature = P256PrehashSigner::sign_prehash(&sk, fb.as_ref()).map_err(|_| JsValue::from_str("ECDSA sign failed"))?;
            Ok(Uint8Array::from(sig.to_der().as_bytes()))
        }
        Curve::Secp256k1 => {
            use k256::ecdsa::{Signature, SigningKey};
            let fb_key = k256::FieldBytes::from_slice(&pk);
            let sk = SigningKey::from_bytes(fb_key).map_err(|_| JsValue::from_str("Invalid secp256k1 private key"))?;
            let fb = k256::FieldBytes::from_slice(&m);
            let sig: Signature = K256PrehashSigner::sign_prehash(&sk, fb.as_ref()).map_err(|_| JsValue::from_str("ECDSA sign failed"))?;
            Ok(Uint8Array::from(sig.to_der().as_bytes()))
        }
    }
}

#[wasm_bindgen]
pub fn ecdsa_verify(curve: JsValue, public_key_uncompressed: Uint8Array, message_hash32: Uint8Array, signature_der: Uint8Array) -> Result<bool, JsValue> {
    let which: Curve = serde_wasm_bindgen::from_value(curve)
        .map_err(|_| JsValue::from_str("Invalid curve"))?;
    let pk = public_key_uncompressed.to_vec();
    let m = message_hash32.to_vec();
    let sig_der = signature_der.to_vec();
    if m.len() != 32 { return Err(JsValue::from_str("ECDSA verify expects 32-byte message hash")); }
    match which {
        Curve::P256 => {
            use p256::ecdsa::{Signature, VerifyingKey};
            let enc = p256::EncodedPoint::from_bytes(&pk).map_err(|_| JsValue::from_str("Invalid P-256 public key"))?;
            let vk = VerifyingKey::from_encoded_point(&enc).map_err(|_| JsValue::from_str("Invalid P-256 public key"))?;
            let sig = Signature::from_der(&sig_der).map_err(|_| JsValue::from_str("Invalid ECDSA signature"))?;
            let fb = p256::FieldBytes::from_slice(&m);
            Ok(P256PrehashVerifier::verify_prehash(&vk, fb.as_ref(), &sig).is_ok())
        }
        Curve::Secp256k1 => {
            use k256::ecdsa::{Signature, VerifyingKey};
            let enc = k256::EncodedPoint::from_bytes(&pk).map_err(|_| JsValue::from_str("Invalid secp256k1 public key"))?;
            let vk = VerifyingKey::from_encoded_point(&enc).map_err(|_| JsValue::from_str("Invalid secp256k1 public key"))?;
            let sig = Signature::from_der(&sig_der).map_err(|_| JsValue::from_str("Invalid ECDSA signature"))?;
            let fb = k256::FieldBytes::from_slice(&m);
            Ok(K256PrehashVerifier::verify_prehash(&vk, fb.as_ref(), &sig).is_ok())
        }
    }
}


