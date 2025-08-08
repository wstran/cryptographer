use js_sys::Uint8Array;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;
use p256::elliptic_curve::sec1::ToEncodedPoint;
use p256::ecdh::{diffie_hellman as dh256};
use p256::{EncodedPoint as EncodedPointP256, PublicKey as PublicKeyP256, SecretKey as SecretKeyP256};

use p384::elliptic_curve::sec1::{FromEncodedPoint as FromEncodedPoint384};
use p384::ecdh::{diffie_hellman as dh384};
use p384::{EncodedPoint as EncodedPointP384, PublicKey as PublicKeyP384, SecretKey as SecretKeyP384};

#[wasm_bindgen]
pub enum EcdhCurveJs {
    P256,
    P384,
}

#[wasm_bindgen]
pub fn ecdh_generate_keypair(curve: EcdhCurveJs) -> Result<js_sys::Array, JsValue> {
    let arr = js_sys::Array::new();
    match curve {
        EcdhCurveJs::P256 => {
            let sk = SecretKeyP256::random(&mut OsRng);
            let pk = PublicKeyP256::from_secret_scalar(&sk.to_nonzero_scalar());
            arr.push(&Uint8Array::from(sk.to_bytes().as_slice()));
            arr.push(&Uint8Array::from(pk.to_encoded_point(false).as_bytes()));
        }
        EcdhCurveJs::P384 => {
            let sk = SecretKeyP384::random(&mut OsRng);
            let pk = PublicKeyP384::from_secret_scalar(&sk.to_nonzero_scalar());
            arr.push(&Uint8Array::from(sk.to_bytes().as_slice()));
            arr.push(&Uint8Array::from(pk.to_encoded_point(false).as_bytes()));
        }
    }
    Ok(arr)
}

#[wasm_bindgen]
pub fn ecdh_derive_shared_secret(curve: EcdhCurveJs, private_key: Uint8Array, peer_public_key: Uint8Array) -> Result<Uint8Array, JsValue> {

    match curve {
        EcdhCurveJs::P256 => {
            let sk_bytes = private_key.to_vec();
            let pk_bytes = peer_public_key.to_vec();
            if sk_bytes.len() != 32 { return Err(JsValue::from_str("P-256 private key must be 32 bytes")); }
            let sk = SecretKeyP256::from_slice(&sk_bytes).map_err(|_| JsValue::from_str("Invalid P-256 private key"))?;
            let ep = EncodedPointP256::from_bytes(&pk_bytes).map_err(|_| JsValue::from_str("Invalid P-256 public key"))?;
            let pk = PublicKeyP256::from_encoded_point(&ep).unwrap();
            let secret = dh256(&sk.to_nonzero_scalar(), pk.as_affine());
            Ok(Uint8Array::from(secret.raw_secret_bytes().as_slice()))
        }
        EcdhCurveJs::P384 => {
            let sk_bytes = private_key.to_vec();
            let pk_bytes = peer_public_key.to_vec();
            if sk_bytes.len() != 48 { return Err(JsValue::from_str("P-384 private key must be 48 bytes")); }
            let sk = SecretKeyP384::from_slice(&sk_bytes).map_err(|_| JsValue::from_str("Invalid P-384 private key"))?;
            let ep = EncodedPointP384::from_bytes(&pk_bytes).map_err(|_| JsValue::from_str("Invalid P-384 public key"))?;
            let pk = PublicKeyP384::from_encoded_point(&ep).unwrap();
            let secret = dh384(&sk.to_nonzero_scalar(), pk.as_affine());
            Ok(Uint8Array::from(secret.raw_secret_bytes().as_slice()))
        }
    }
}
