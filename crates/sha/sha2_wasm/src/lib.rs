use js_sys::Uint8Array;
use serde::Deserialize;
use sha2::{Digest, Sha224, Sha256, Sha384, Sha512, Sha512_224, Sha512_256};
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ShaType {
    Sha224,
    Sha256,
    Sha384,
    Sha512,
    Sha512_224,
    Sha512_256,
}

#[derive(Deserialize)]
struct HashOptions {
    #[serde(default)]
    algo: Option<ShaType>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from(e.to_string()))?;

    let offset = input.byte_offset() as usize;

    let len = input.length() as usize;

    let ptr = offset as *const u8;

    let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    let output = match opts.algo.unwrap_or(ShaType::Sha256) {
        ShaType::Sha224 => Sha224::digest(input_slice).to_vec(),
        ShaType::Sha256 => Sha256::digest(input_slice).to_vec(),
        ShaType::Sha384 => Sha384::digest(input_slice).to_vec(),
        ShaType::Sha512 => Sha512::digest(input_slice).to_vec(),
        ShaType::Sha512_224 => Sha512_224::digest(input_slice).to_vec(),
        ShaType::Sha512_256 => Sha512_256::digest(input_slice).to_vec(),
    };

    Ok(output.into_boxed_slice())
}

enum Sha2Impl {
    Sha224(Sha224),
    Sha256(Sha256),
    Sha384(Sha384),
    Sha512(Sha512),
    Sha512_224(Sha512_224),
    Sha512_256(Sha512_256),
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: Option<Sha2Impl>,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: HashOptions =
            serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from(e.to_string()))?;

        let inner = match opts.algo.unwrap_or(ShaType::Sha256) {
            ShaType::Sha224 => Sha2Impl::Sha224(Sha224::new()),
            ShaType::Sha256 => Sha2Impl::Sha256(Sha256::new()),
            ShaType::Sha384 => Sha2Impl::Sha384(Sha384::new()),
            ShaType::Sha512 => Sha2Impl::Sha512(Sha512::new()),
            ShaType::Sha512_224 => Sha2Impl::Sha512_224(Sha512_224::new()),
            ShaType::Sha512_256 => Sha2Impl::Sha512_256(Sha512_256::new()),
        };

        Ok(Self { inner: Some(inner) })
    }

    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let offset = input.byte_offset() as usize;

        let len = input.length() as usize;

        let ptr = offset as *const u8;

        let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

        match &mut self.inner {
            Some(Sha2Impl::Sha224(h)) => {
                h.update(input_slice);

                Ok(())
            }
            Some(Sha2Impl::Sha256(h)) => {
                h.update(input_slice);

                Ok(())
            }
            Some(Sha2Impl::Sha384(h)) => {
                h.update(input_slice);

                Ok(())
            }
            Some(Sha2Impl::Sha512(h)) => {
                h.update(input_slice);

                Ok(())
            }
            Some(Sha2Impl::Sha512_224(h)) => {
                h.update(input_slice);

                Ok(())
            }
            Some(Sha2Impl::Sha512_256(h)) => {
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
            Sha2Impl::Sha224(h) => h.finalize().to_vec(),
            Sha2Impl::Sha256(h) => h.finalize().to_vec(),
            Sha2Impl::Sha384(h) => h.finalize().to_vec(),
            Sha2Impl::Sha512(h) => h.finalize().to_vec(),
            Sha2Impl::Sha512_224(h) => h.finalize().to_vec(),
            Sha2Impl::Sha512_256(h) => h.finalize().to_vec(),
        };

        Ok(res.into_boxed_slice())
    }
}
