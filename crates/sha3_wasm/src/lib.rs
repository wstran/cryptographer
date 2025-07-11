use js_sys::Uint8Array;
use serde::Deserialize;
use sha3::{
digest::{ExtendableOutput, Update, XofReader},
Digest, Keccak224, Keccak256, Keccak384, Keccak512, Sha3_224, Sha3_256, Sha3_384, Sha3_512,
Shake128, Shake256,
};
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Sha3Type {
    Sha3_224,
    Sha3_256,
    Sha3_384,
    Sha3_512,
    Shake128,
    Shake256,
    Keccak224,
    Keccak256,
    Keccak384,
    Keccak512,
}

#[derive(Deserialize)]
struct HashOptions {
    algo: Sha3Type,
    #[serde(default)]
    pub hash_length: Option<usize>,
}

#[wasm_bindgen]
pub fn hash(input: Uint8Array, options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let opts: HashOptions =
        serde_wasm_bindgen::from_value(options).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let input_bytes = input.to_vec();

    let output = match opts.algo {
        Sha3Type::Sha3_224 => Sha3_224::digest(&input_bytes).to_vec(),
        Sha3Type::Sha3_256 => Sha3_256::digest(&input_bytes).to_vec(),
        Sha3Type::Sha3_384 => Sha3_384::digest(&input_bytes).to_vec(),
        Sha3Type::Sha3_512 => Sha3_512::digest(&input_bytes).to_vec(),
        Sha3Type::Keccak224 => Keccak224::digest(&input_bytes).to_vec(),
        Sha3Type::Keccak256 => Keccak256::digest(&input_bytes).to_vec(),
        Sha3Type::Keccak384 => Keccak384::digest(&input_bytes).to_vec(),
        Sha3Type::Keccak512 => Keccak512::digest(&input_bytes).to_vec(),
        Sha3Type::Shake128 => {
            let len = opts
                .hash_length
                .ok_or_else(|| JsValue::from_str("Shake128 requires hash_length"))?;

            let mut hasher = Shake128::default();

            hasher.update(&input_bytes);

            let mut buf = vec![0u8; len];

            hasher.finalize_xof().read(&mut buf);

            buf
        }
        Sha3Type::Shake256 => {
            let len = opts
                .hash_length
                .ok_or_else(|| JsValue::from_str("Shake256 requires hash_length"))?;

            let mut hasher = Shake256::default();
            
            hasher.update(&input_bytes);

            let mut buf = vec![0u8; len];

            hasher.finalize_xof().read(&mut buf);
            
            buf
        }
    };

    Ok(output.into_boxed_slice())
}
