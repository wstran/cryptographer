use wasm_bindgen::prelude::*;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use whirlpool::{Whirlpool, Digest};
use js_sys::Uint8Array;

#[derive(Deserialize)]
struct HashOptions {
    #[serde(default)]
    hash_length: Option<usize>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions = from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let mut hasher = Whirlpool::new();

    hasher.update(input.to_vec());

    let hash = hasher.finalize();
    
    if let Some(len) = opts.hash_length {
        if len > 512 {
            return Err(JsValue::from_str("Hash length must be <= 512"));
        }
        
        Ok(hash.as_slice()[..len].to_vec().into_boxed_slice())
    } else {
        Ok(hash.as_slice().to_vec().into_boxed_slice())
    }
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: Whirlpool,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> StreamingHasher {
        StreamingHasher {
            inner: Whirlpool::new(),
        }
    }

    pub fn update(&mut self, data: Uint8Array) {
        self.inner.update(data.to_vec());
    }

    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.clone().finalize().as_slice().to_vec().into_boxed_slice()
    }
}
