use js_sys::Uint8Array;
use md5::{Digest, Md5};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hash(input: Uint8Array) -> Box<[u8]> {
    let bytes = input.to_vec();
    let mut hasher = Md5::new();
    hasher.update(&bytes);
    let result = hasher.finalize();
    result.to_vec().into_boxed_slice()
}