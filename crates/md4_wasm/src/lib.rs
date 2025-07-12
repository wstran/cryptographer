use js_sys::Uint8Array;
use md4::{Digest, Md4};
use serde::Deserialize;
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

    let mut hasher = Md4::new();

    hasher.update(input.to_vec());

    let hash_output = hasher.finalize().to_vec();

    if let Some(len) = opts.hash_length {
        if len > 16 {
            return Err(JsValue::from_str("Hash length must be <= 16 for MD4"));
        }

        Ok(hash_output[..len].to_vec().into_boxed_slice())
    } else {
        Ok(hash_output.into_boxed_slice())
    }
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: Md4,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: HashOptions = serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let inner = Md4::new();

        Ok(StreamingHasher { inner })
    }

    pub fn update(&mut self, data: Uint8Array) -> Result<(), JsValue> {
        self.inner.update(&data.to_vec());

        Ok(())
    }

    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.clone().finalize().to_vec().into_boxed_slice()
    }

    pub fn finalize_xof(&self, length: usize) -> Result<Box<[u8]>, JsValue> {
        if length > 16 {
            return Err(JsValue::from_str("Length must be <= 16 for MD4"));
        }

        let full = self.inner.clone().finalize().to_vec();
        
        Ok(full[..length].to_vec().into_boxed_slice())
    }
}
