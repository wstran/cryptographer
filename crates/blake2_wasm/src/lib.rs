use wasm_bindgen::prelude::*;
use js_sys::Uint8Array;
use serde::Deserialize;
use serde_wasm_bindgen;
use blake2::{Blake2b512, Blake2s256, Digest};

#[wasm_bindgen]
#[derive(Deserialize)]
pub enum Blake2Type {
    Blake2b,
    Blake2s,
}

#[derive(Deserialize)]
pub struct Blake2Options {
    algo: Blake2Type,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: Blake2Options = serde_wasm_bindgen::from_value(options)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let bytes = input.to_vec();

    let hash = match opts.algo {
        Blake2Type::Blake2b => Blake2b512::digest(&bytes).to_vec(),
        Blake2Type::Blake2s => Blake2s256::digest(&bytes).to_vec(),
    };

    Ok(hash.into_boxed_slice())
}