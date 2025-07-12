use blake2::{Blake2b512, Blake2s256, Digest};
use js_sys::Uint8Array;
use serde::Deserialize;
use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Deserialize)]
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

    let bytes = input.to_vec();

    let hash = match opts.algo {
        Blake2Type::Blake2b => Blake2b512::digest(&bytes).to_vec(),
        Blake2Type::Blake2s => Blake2s256::digest(&bytes).to_vec(),
    };

    Ok(hash.into_boxed_slice())
}

#[wasm_bindgen]
pub struct StreamingHasher {
    hasher_b2b: Option<Blake2b512>,
    hasher_b2s: Option<Blake2s256>,
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: Blake2Options = serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let hasher_b2b = if let Blake2Type::Blake2b = opts.algo {
            Some(Blake2b512::new())
        } else {
            None
        };

        let hasher_b2s = if let Blake2Type::Blake2s = opts.algo {
            Some(Blake2s256::new())
        } else {
            None
        };

        Ok(StreamingHasher {
            hasher_b2b,
            hasher_b2s,
        })
    }

    #[wasm_bindgen]
    pub fn update(&mut self, data: Uint8Array) -> Result<(), JsValue> {
        if let Some(ref mut hasher) = self.hasher_b2b {
            hasher.update(&data.to_vec());
        } else if let Some(ref mut hasher) = self.hasher_b2s {
            hasher.update(&data.to_vec());
        }

        Ok(())
    }

    #[wasm_bindgen]
    pub fn finalize(&self) -> Result<Box<[u8]>, JsValue> {
        let result = if let Some(ref hasher) = self.hasher_b2b {
            hasher.clone().finalize().to_vec()
        } else if let Some(ref hasher) = self.hasher_b2s {
            hasher.clone().finalize().to_vec()
        } else {
            return Err(JsValue::from_str("Hasher not initialized"));
        };

        Ok(result.into_boxed_slice())
    }
}
