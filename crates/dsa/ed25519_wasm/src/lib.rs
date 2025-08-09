use js_sys::Uint8Array;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;
use ed25519_dalek::{Signer, Verifier};
use ed25519_dalek::{SigningKey, VerifyingKey, Signature};

#[wasm_bindgen]
pub fn ed25519_generate_keypair() -> js_sys::Array {
    let signing_key = SigningKey::generate(&mut OsRng);
    let verify_key: VerifyingKey = signing_key.verifying_key();
    let arr = js_sys::Array::new();
    arr.push(&Uint8Array::from(signing_key.to_bytes().as_slice()));
    arr.push(&Uint8Array::from(verify_key.to_bytes().as_slice()));
    arr
}

#[wasm_bindgen]
pub fn ed25519_sign(private_key: Uint8Array, message: Uint8Array) -> Result<Uint8Array, JsValue> {
    let sk_vec = private_key.to_vec();
    if sk_vec.len() != 32 {
        return Err(JsValue::from_str("Ed25519 private key must be 32 bytes"));
    }
    let mut sk_bytes = [0u8; 32];
    sk_bytes.copy_from_slice(&sk_vec);
    let sk = SigningKey::from_bytes(&sk_bytes);
    let sig: Signature = sk.sign(&message.to_vec());
    Ok(Uint8Array::from(sig.to_bytes().as_slice()))
}

#[wasm_bindgen]
pub fn ed25519_verify(public_key: Uint8Array, message: Uint8Array, signature: Uint8Array) -> Result<bool, JsValue> {
    let pk_vec = public_key.to_vec();
    if pk_vec.len() != 32 {
        return Err(JsValue::from_str("Ed25519 public key must be 32 bytes"));
    }
    let mut pk_bytes = [0u8; 32];
    pk_bytes.copy_from_slice(&pk_vec);
    let vk = VerifyingKey::from_bytes(&pk_bytes).map_err(|_| JsValue::from_str("Invalid Ed25519 public key"))?;

    let sig_vec = signature.to_vec();
    if sig_vec.len() != 64 {
        return Err(JsValue::from_str("Ed25519 signature must be 64 bytes"));
    }
    let mut sig_bytes = [0u8; 64];
    sig_bytes.copy_from_slice(&sig_vec);
    let sig = Signature::from_bytes(&sig_bytes);
    Ok(vk.verify(&message.to_vec(), &sig).is_ok())
}


