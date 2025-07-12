use wasm_bindgen::prelude::*;
use whirlpool::{Whirlpool, Digest};
use whirlpool::digest::FixedOutput;
use js_sys::Uint8Array;

#[wasm_bindgen]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let mut hasher = Whirlpool::new();

    hasher.update(input.to_vec());

    hasher.finalize_fixed().as_slice().to_vec().into_boxed_slice()
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

    #[wasm_bindgen]
    pub fn update(&mut self, data: Uint8Array) {
        self.inner.update(data.to_vec());
    }

    #[wasm_bindgen]
    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.clone().finalize_fixed().as_slice().to_vec().into_boxed_slice()
    }
}
