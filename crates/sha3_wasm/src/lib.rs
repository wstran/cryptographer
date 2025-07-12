use js_sys::Uint8Array;
use serde::Deserialize;
use sha3::{
    digest::{Digest, ExtendableOutput, Update, XofReader},
    Keccak224, Keccak256, Keccak384, Keccak512, Sha3_224, Sha3_256, Sha3_384, Sha3_512, Shake128,
    Shake256,
};
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Clone)]
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
            let len = opts.hash_length.ok_or("Shake128 requires hash_length")?;

            let mut hasher = Shake128::default();

            hasher.update(&input_bytes);

            let mut buf = vec![0u8; len];

            hasher.finalize_xof().read(&mut buf);

            buf
        }
        Sha3Type::Shake256 => {
            let len = opts.hash_length.ok_or("Shake256 requires hash_length")?;

            let mut hasher = Shake256::default();

            hasher.update(&input_bytes);

            let mut buf = vec![0u8; len];

            hasher.finalize_xof().read(&mut buf);

            buf
        }
    };

    Ok(output.into_boxed_slice())
}

#[wasm_bindgen]
pub struct StreamingHasher {
    inner: StreamingInner,
}

enum StreamingInner {
    Digest(DigestImpl),
    Xof(XofImpl),
}

enum DigestImpl {
    Sha3_224(Sha3_224),
    Sha3_256(Sha3_256),
    Sha3_384(Sha3_384),
    Sha3_512(Sha3_512),
    Keccak224(Keccak224),
    Keccak256(Keccak256),
    Keccak384(Keccak384),
    Keccak512(Keccak512),
}

enum XofImpl {
    Shake128(Shake128),
    Shake256(Shake256),
}

#[wasm_bindgen]
impl StreamingHasher {
    #[wasm_bindgen(constructor)]
    pub fn new(options: JsValue) -> Result<StreamingHasher, JsValue> {
        let opts: HashOptions = serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let inner = match opts.algo {
            Sha3Type::Sha3_224 => StreamingInner::Digest(DigestImpl::Sha3_224(Sha3_224::new())),
            Sha3Type::Sha3_256 => StreamingInner::Digest(DigestImpl::Sha3_256(Sha3_256::new())),
            Sha3Type::Sha3_384 => StreamingInner::Digest(DigestImpl::Sha3_384(Sha3_384::new())),
            Sha3Type::Sha3_512 => StreamingInner::Digest(DigestImpl::Sha3_512(Sha3_512::new())),
            Sha3Type::Keccak224 => StreamingInner::Digest(DigestImpl::Keccak224(Keccak224::new())),
            Sha3Type::Keccak256 => StreamingInner::Digest(DigestImpl::Keccak256(Keccak256::new())),
            Sha3Type::Keccak384 => StreamingInner::Digest(DigestImpl::Keccak384(Keccak384::new())),
            Sha3Type::Keccak512 => StreamingInner::Digest(DigestImpl::Keccak512(Keccak512::new())),
            Sha3Type::Shake128 => StreamingInner::Xof(XofImpl::Shake128(Shake128::default())),
            Sha3Type::Shake256 => StreamingInner::Xof(XofImpl::Shake256(Shake256::default())),
        };

        Ok(Self { inner })
    }

    pub fn update(&mut self, data: Uint8Array) {
        let buf = data.to_vec();

        match &mut self.inner {
            StreamingInner::Digest(d) => match d {
                DigestImpl::Sha3_224(h) => Digest::update(h, &buf),
                DigestImpl::Sha3_256(h) => Digest::update(h, &buf),
                DigestImpl::Sha3_384(h) => Digest::update(h, &buf),
                DigestImpl::Sha3_512(h) => Digest::update(h, &buf),
                DigestImpl::Keccak224(h) => Digest::update(h, &buf),
                DigestImpl::Keccak256(h) => Digest::update(h, &buf),
                DigestImpl::Keccak384(h) => Digest::update(h, &buf),
                DigestImpl::Keccak512(h) => Digest::update(h, &buf),
            },
            StreamingInner::Xof(x) => match x {
                XofImpl::Shake128(h) => h.update(&buf),
                XofImpl::Shake256(h) => h.update(&buf),
            },
        }
    }

    pub fn finalize(&mut self, hash_length: Option<usize>) -> Result<Box<[u8]>, JsValue> {
        match std::mem::replace(
            &mut self.inner,
            StreamingInner::Digest(DigestImpl::Sha3_224(Sha3_224::new())),
        ) {
            StreamingInner::Digest(d) => {
                let result = match d {
                    DigestImpl::Sha3_224(h) => h.finalize().to_vec(),
                    DigestImpl::Sha3_256(h) => h.finalize().to_vec(),
                    DigestImpl::Sha3_384(h) => h.finalize().to_vec(),
                    DigestImpl::Sha3_512(h) => h.finalize().to_vec(),
                    DigestImpl::Keccak224(h) => h.finalize().to_vec(),
                    DigestImpl::Keccak256(h) => h.finalize().to_vec(),
                    DigestImpl::Keccak384(h) => h.finalize().to_vec(),
                    DigestImpl::Keccak512(h) => h.finalize().to_vec(),
                };
                
                Ok(result.into_boxed_slice())
            }
            StreamingInner::Xof(x) => {
                let len =
                    hash_length.ok_or_else(|| JsValue::from_str("XOF requires hash_length"))?;

                let mut buf = vec![0u8; len];

                match x {
                    XofImpl::Shake128(h) => h.finalize_xof().read(&mut buf),
                    XofImpl::Shake256(h) => h.finalize_xof().read(&mut buf),
                };

                Ok(buf.into_boxed_slice())
            }
        }
    }
}
