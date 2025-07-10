use blake3::Hasher;
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
struct HashOptions {
    #[serde(default)]
    keyed: Option<Vec<u8>>,
    #[serde(default)]
    derive_key: Option<String>,
    #[serde(default)]
    hash_length: Option<usize>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let input_bytes = input.to_vec();

    let mut hasher = if let Some(key_bytes) = opts.keyed {
        if key_bytes.len() != 32 {
            return Err(JsValue::from_str("Key must be 32 bytes"));
        }
        Hasher::new_keyed(
            &key_bytes
                .try_into()
                .map_err(|_| JsValue::from_str("Key must be 32 bytes"))?,
        )
    } else if let Some(context) = opts.derive_key {
        if context.is_empty() {
            return Err(JsValue::from_str("Derive key cannot be empty"));
        }
        Hasher::new_derive_key(&context)
    } else {
        Hasher::new()
    };

    hasher.update(&input_bytes);

    if let Some(len) = opts.hash_length {
        if len > 1024 {
            return Err(JsValue::from_str("Hash length must be <= 1024"));
        }
        let mut reader = hasher.finalize_xof();
        let mut buf = vec![0u8; len];
        reader.fill(&mut buf);
        Ok(buf.into_boxed_slice())
    } else {
        Ok(hasher.finalize().as_bytes().to_vec().into_boxed_slice())
    }
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: Hasher,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: HashOptions = serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let inner = if let Some(key_bytes) = opts.keyed {
            if key_bytes.len() != 32 {
                return Err(JsValue::from_str("Key must be 32 bytes"));
            }

            let key_array: [u8; 32] = key_bytes
                .try_into()
                .map_err(|_| JsValue::from_str("Invalid key format"))?;

            Hasher::new_keyed(&key_array)
        } else if let Some(context) = opts.derive_key {
            if context.is_empty() {
                return Err(JsValue::from_str("Derive key cannot be empty"));
            }

            Hasher::new_derive_key(&context)
        } else {
            Hasher::new()
        };

        Ok(StreamingHasher { inner })
    }

    pub fn update(&mut self, data: Uint8Array) -> Result<(), JsValue> {
        self.inner.update(&data.to_vec());
        Ok(())
    }

    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.finalize().as_bytes().to_vec().into_boxed_slice()
    }

    pub fn finalize_xof(&self, length: usize) -> Result<Box<[u8]>, JsValue> {
        if length > 1024 {
            return Err(JsValue::from_str("Hash length must be <= 1024"));
        }
        let mut reader = self.inner.finalize_xof();
        let mut buf = vec![0u8; length];
        reader.fill(&mut buf);
        Ok(buf.into_boxed_slice())
    }
}
