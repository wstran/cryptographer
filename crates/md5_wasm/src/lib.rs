use js_sys::Uint8Array;
use md5::{Digest, Md5};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let mut hasher = Md5::new();

    hasher.update(input.to_vec());

    hasher.finalize().to_vec().into_boxed_slice()
}

#[wasm_bindgen]
pub struct StreamingMd5 {
    hasher: Md5,
}

#[wasm_bindgen]
impl StreamingMd5 {
    #[wasm_bindgen(constructor)]
    pub fn new() -> StreamingMd5 {
        StreamingMd5 { hasher: Md5::new() }
    }

    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        self.hasher.update(input.to_vec());
        
        Ok(())
    }

    pub fn finalize(&mut self) -> Box<[u8]> {
        self.hasher.clone().finalize().to_vec().into_boxed_slice()
    }
}
