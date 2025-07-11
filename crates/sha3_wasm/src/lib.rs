use js_sys::Uint8Array;
use serde::Deserialize;
use sha3::{Digest, Keccak256, Sha3_224, Sha3_256, Sha3_384, Sha3_512};
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Sha3Type {
    Sha3_224,
    Sha3_256,
    Sha3_384,
    Sha3_512,
    Keccak256,
}

#[derive(Deserialize)]
struct HashOptions {
    algo: Sha3Type,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let input_bytes = input.to_vec();

    let result = match opts.algo {
        Sha3Type::Sha3_224 => Sha3_224::digest(&input_bytes).to_vec(),
        Sha3Type::Sha3_256 => Sha3_256::digest(&input_bytes).to_vec(),
        Sha3Type::Sha3_384 => Sha3_384::digest(&input_bytes).to_vec(),
        Sha3Type::Sha3_512 => Sha3_512::digest(&input_bytes).to_vec(),
        Sha3Type::Keccak256 => Keccak256::digest(&input_bytes).to_vec(),
    };

    Ok(result.into_boxed_slice())
}
