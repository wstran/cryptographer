use js_sys::Uint8Array;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;
use x25519_dalek::{PublicKey, StaticSecret};

#[wasm_bindgen]
pub fn x25519_generate_keypair() -> js_sys::Array {
    let sk = StaticSecret::random_from_rng(OsRng);
    let pk = PublicKey::from(&sk);
    let arr = js_sys::Array::new();
    arr.push(&Uint8Array::from(sk.to_bytes().as_slice()));
    arr.push(&Uint8Array::from(pk.to_bytes().as_slice()));
    arr
}

#[wasm_bindgen]
pub fn x25519_derive_shared_secret(private_key: Uint8Array, peer_public_key: Uint8Array) -> Result<Uint8Array, JsValue> {
    let mut sk_bytes = [0u8; 32];
    let mut pk_bytes = [0u8; 32];
    let sk_vec = private_key.to_vec();
    let pk_vec = peer_public_key.to_vec();
    if sk_vec.len() != 32 || pk_vec.len() != 32 {
        return Err(JsValue::from_str("X25519 keys must be 32 bytes"));
    }
    sk_bytes.copy_from_slice(&sk_vec);
    pk_bytes.copy_from_slice(&pk_vec);
    let sk = StaticSecret::from(sk_bytes);
    let pk = PublicKey::from(pk_bytes);
    let shared = sk.diffie_hellman(&pk);
    Ok(Uint8Array::from(shared.as_bytes().as_slice()))
}
