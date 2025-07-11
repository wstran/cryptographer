use js_sys::Uint8Array;
use serde::Deserialize;
use sha2::{Digest, Sha224, Sha256, Sha384, Sha512, Sha512_224, Sha512_256};
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShaType {
    Sha224,
    Sha256,
    Sha384,
    Sha512,
    Sha512_224,
    Sha512_256
}

#[derive(Deserialize)]
struct HashOptions {
    #[serde(default)]
    algo: Option<ShaType>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let input_bytes = input.to_vec();

    let output = match opts.algo.unwrap_or(ShaType::Sha256) {
        ShaType::Sha224 => Sha224::digest(&input_bytes).to_vec(),
        ShaType::Sha256 => Sha256::digest(&input_bytes).to_vec(),
        ShaType::Sha384 => Sha384::digest(&input_bytes).to_vec(),
        ShaType::Sha512 => Sha512::digest(&input_bytes).to_vec(),
        ShaType::Sha512_224 => Sha512_224::digest(&input_bytes).to_vec(),
        ShaType::Sha512_256 => Sha512_256::digest(&input_bytes).to_vec(),
    };

    Ok(output.into_boxed_slice())
}
