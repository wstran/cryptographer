use sha1::{Digest, Sha1};

#[cfg(feature = "wasm")]
use js_sys::Uint8Array;
#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let bytes = input.to_vec();
    
    let mut hasher = Sha1::new();

    hasher.update(&bytes);

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

    pub fn update(&mut self, data: Uint8Array) {
        self.inner.update(&data.to_vec());
    }

    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.clone().finalize().to_vec().into_boxed_slice()
    }
}
