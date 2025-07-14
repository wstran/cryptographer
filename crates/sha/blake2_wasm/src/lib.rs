use blake2::{Blake2b512, Blake2s256, Digest};
use js_sys::Uint8Array;
use serde::Deserialize;
use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Blake2Type {
    Blake2b,
    Blake2s,
}

#[derive(Deserialize)]
pub struct Blake2Options {
    algo: Blake2Type,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: Blake2Options =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let offset = input.byte_offset() as usize;

    let len = input.length() as usize;

    let ptr = offset as *const u8;

    let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    let hash = match opts.algo {
        Blake2Type::Blake2b => Blake2b512::digest(input_slice).to_vec(),
        Blake2Type::Blake2s => Blake2s256::digest(input_slice).to_vec(),
    };

    Ok(hash.into_boxed_slice())
}

enum Blake2Impl {
    Blake2b(Blake2b512),
    Blake2s(Blake2s256),
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: Option<Blake2Impl>,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: Blake2Options = serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let inner = match opts.algo {
            Blake2Type::Blake2b => Blake2Impl::Blake2b(Blake2b512::new()),
            Blake2Type::Blake2s => Blake2Impl::Blake2s(Blake2s256::new()),
        };

        Ok(StreamingHasher { inner: Some(inner) })
    }

    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let offset = input.byte_offset() as usize;

        let len = input.length() as usize;

        let ptr = offset as *const u8;

        let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

        match &mut self.inner {
            Some(Blake2Impl::Blake2b(h)) => {
                h.update(input_slice);
                Ok(())
            }
            Some(Blake2Impl::Blake2s(h)) => {
                h.update(input_slice);
                Ok(())
            }
            None => Err(JsValue::from_str("Hasher has been finalized")),
        }
    }

    pub fn finalize(&mut self) -> Result<Box<[u8]>, JsValue> {
        let inner = self
            .inner
            .take()
            .ok_or_else(|| JsValue::from_str("Already finalized"))?;

        let res = match inner {
            Blake2Impl::Blake2b(h) => h.finalize().to_vec(),
            Blake2Impl::Blake2s(h) => h.finalize().to_vec(),
        };

        Ok(res.into_boxed_slice())
    }
}
