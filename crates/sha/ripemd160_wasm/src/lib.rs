use js_sys::Uint8Array;
use ripemd::{Digest, Ripemd160};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let mut hasher = Ripemd160::new();

    let offset = input.byte_offset() as usize;

    let len = input.length() as usize;

    let ptr = offset as *const u8;

    let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    hasher.update(input_slice);

    let full_hash = hasher.finalize().to_vec();

    full_hash.into_boxed_slice()
}

#[wasm_bindgen]
pub struct StreamingHasher {
    hasher: Ripemd160,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        StreamingHasher {
            hasher: Ripemd160::new(),
        }
    }

    #[wasm_bindgen]
    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let offset = input.byte_offset() as usize;

        let len = input.length() as usize;

        let ptr = offset as *const u8;

        let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

        self.hasher.update(input_slice);

        Ok(())
    }

    #[wasm_bindgen]
    pub fn finalize(&self) -> Box<[u8]> {
        self.hasher.clone().finalize().to_vec().into_boxed_slice()
    }
}
