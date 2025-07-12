use js_sys::Uint8Array;
use ripemd::{Digest, Ripemd160};
use serde::Deserialize;
use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
struct HashOptions {
    #[serde(default)]
    hash_length: Option<usize>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let input_bytes = input.to_vec();

    let mut hasher = Ripemd160::new();

    hasher.update(&input_bytes);

    let result = hasher.finalize();

    let full_hash = result.to_vec();

    if let Some(len) = opts.hash_length {
        if len > full_hash.len() {
            return Err(JsValue::from_str(
                "Hash length exceeds RIPEMD160 output (20 bytes)",
            ));
        }
        
        Ok(full_hash[..len].to_vec().into_boxed_slice())
    } else {
        Ok(full_hash.into_boxed_slice())
    }
}
