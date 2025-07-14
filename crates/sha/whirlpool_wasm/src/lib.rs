use wasm_bindgen::prelude::*;
use whirlpool::{Whirlpool, Digest};
use whirlpool::digest::FixedOutput;
use js_sys::Uint8Array;

#[wasm_bindgen]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let mut hasher = Whirlpool::new();

    let offset = input.byte_offset() as usize;

    let len = input.length() as usize;

    let ptr = offset as *const u8;

    let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    hasher.update(input_slice);

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
    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let offset = input.byte_offset() as usize;

        let len = input.length() as usize;

        let ptr = offset as *const u8;

        let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };
        
        self.inner.update(input_slice);

        Ok(())
    }

    #[wasm_bindgen]
    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.clone().finalize_fixed().as_slice().to_vec().into_boxed_slice()
    }
}
