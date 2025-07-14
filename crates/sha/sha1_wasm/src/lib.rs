use sha1::{Digest, Sha1};

#[cfg(feature = "wasm")]
use js_sys::Uint8Array;
#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let mut hasher = Sha1::new();

    let offset = input.byte_offset() as usize;

    let len = input.length() as usize;

    let ptr = offset as *const u8;

    let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    hasher.update(input_slice);

    hasher.finalize().to_vec().into_boxed_slice()
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub struct StreamingSha1 {
    inner: Sha1,
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
impl StreamingSha1 {
    #[cfg_attr(feature = "wasm", wasm_bindgen(constructor))]
    pub fn new() -> StreamingSha1 {
        StreamingSha1 { inner: Sha1::new() }
    }

    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let offset = input.byte_offset() as usize;

        let len = input.length() as usize;

        let ptr = offset as *const u8;

        let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

        self.inner.update(input_slice);

        Ok(())
    }

    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.clone().finalize().to_vec().into_boxed_slice()
    }
}
