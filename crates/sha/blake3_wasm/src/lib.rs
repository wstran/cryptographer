use blake3::Hasher;
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
struct HashOptions {
    keyed: Option<Vec<u8>>,
    derive_key: Option<String>,
    hash_length: Option<usize>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions = serde_wasm_bindgen::from_value(options)
        .map_err(|e| JsValue::from_str(&format!("Invalid options: {}", e)))?;

    let offset = input.byte_offset() as usize;

    let len = input.length() as usize;

    let ptr = offset as *const u8;

    let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    let mut hasher = match (&opts.keyed, &opts.derive_key) {
        (Some(key), _) if key.len() == 32 => Hasher::new_keyed(&key[..].try_into().unwrap()),
        (_, Some(context)) if !context.is_empty() => Hasher::new_derive_key(context),
        (Some(_), _) => return Err(JsValue::from_str("Key must be 32 bytes")),
        (_, Some(_)) => return Err(JsValue::from_str("Derive key cannot be empty")),
        _ => Hasher::new(),
    };

    hasher.update(input_slice);

    if let Some(len) = opts.hash_length {
        if len > 1024 {
            return Err(JsValue::from_str("Hash length must be <= 1024"));
        }

        let mut buf = vec![0u8; len];

        hasher.finalize_xof().fill(&mut buf);

        Ok(buf.into_boxed_slice())
    } else {
        Ok(hasher.finalize().as_bytes().to_vec().into_boxed_slice())
    }
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: Option<Hasher>,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: HashOptions = serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&format!("Invalid options: {}", e)))?;

        let hasher = match (&opts.keyed, &opts.derive_key) {
            (Some(key), _) if key.len() == 32 => Hasher::new_keyed(&key[..].try_into().unwrap()),
            (_, Some(context)) if !context.is_empty() => Hasher::new_derive_key(context),
            (Some(_), _) => return Err(JsValue::from_str("Key must be 32 bytes")),
            (_, Some(_)) => return Err(JsValue::from_str("Derive key cannot be empty")),
            _ => Hasher::new(),
        };

        Ok(StreamingHasher {
            inner: Some(hasher),
        })
    }

    pub fn update(&mut self, data: Uint8Array) -> Result<(), JsValue> {
        if let Some(ref mut hasher) = self.inner {
            let offset = data.byte_offset() as usize;

            let len = data.length() as usize;

            let ptr = offset as *const u8;

            let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
            
            hasher.update(slice);
            
            Ok(())
        } else {
            Err(JsValue::from_str("Hasher has been finalized"))
        }
    }

    pub fn finalize(&mut self) -> Result<Box<[u8]>, JsValue> {
        match self.inner.take() {
            Some(hasher) => Ok(hasher.finalize().as_bytes().to_vec().into_boxed_slice()),
            None => Err(JsValue::from_str("Already finalized")),
        }
    }

    pub fn finalize_xof(&mut self, length: usize) -> Result<Box<[u8]>, JsValue> {
        if length > 1024 {
            return Err(JsValue::from_str("Hash length must be <= 1024"));
        }

        match self.inner.take() {
            Some(hasher) => {
                let mut buf = vec![0u8; length];

                hasher.finalize_xof().fill(&mut buf);

                Ok(buf.into_boxed_slice())
            }
            None => Err(JsValue::from_str("Already finalized")),
        }
    }
}
