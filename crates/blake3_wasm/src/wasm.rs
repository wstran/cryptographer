use wasm_bindgen::prelude::*;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use blake3::Hasher;

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
pub fn hash(input: &[u8], options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions = from_value(options)?;

    let mut hasher = if let Some(ref key_bytes) = opts.keyed {
        if key_bytes.len() != 32 {
            return Err(JsValue::from("Key must be 32 bytes"));
        }
        
        let mut key = [0u8; 32];
        key.copy_from_slice(&key_bytes[..]);
        
        Hasher::new_keyed(&key)
    } else if let Some(ref context) = opts.derive_key {
        Hasher::new_derive_key(context)
    } else {
        Hasher::new()
    };

    hasher.update(input);

    if let Some(len) = opts.hash_length {
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
        let opts: HashOptions = from_value(options)?;

        let inner = if let Some(ref key_bytes) = opts.keyed {
            if key_bytes.len() != 32 {
                return Err(JsValue::from("Key must be 32 bytes"));
            }
            let mut key = [0u8; 32];
            key.copy_from_slice(&key_bytes[..]);
            Hasher::new_keyed(&key)
        } else if let Some(ref context) = opts.derive_key {
            Hasher::new_derive_key(context)
        } else {
            Hasher::new()
        };

        Ok(StreamingHasher { inner })
    }

    pub fn update(&mut self, data: &[u8]) {
        self.inner.update(data);
    }

    pub fn finalize(&self) -> Box<[u8]> {
        self.inner.finalize().as_bytes().to_vec().into_boxed_slice()
    }

    pub fn finalize_xof(&self, length: usize) -> Box<[u8]> {
        let mut reader = self.inner.finalize_xof();
        let mut buf = vec![0u8; length];
        reader.fill(&mut buf);
        buf.into_boxed_slice()
    }
}