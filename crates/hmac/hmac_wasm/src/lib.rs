use hmac::{Hmac, Mac};
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

use md4::Md4;
use md5::Md5;
use ripemd::{Ripemd160, Ripemd256, Ripemd320};
use sha1::Sha1;
use sha2::{Sha224, Sha256, Sha384, Sha512, Sha512_224, Sha512_256};
use sha3::{Sha3_224, Sha3_256, Sha3_384, Sha3_512};
use whirlpool::Whirlpool;

#[wasm_bindgen]
#[derive(Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum HashAlgorithm {
    Md4,
    Md5,
    Sha1,
    Sha224,
    Sha256,
    Sha384,
    Sha512,
    Sha512_224,
    Sha512_256,
    Sha3_224,
    Sha3_256,
    Sha3_384,
    Sha3_512,
    Ripemd160,
    Ripemd256,
    Ripemd320,
    Whirlpool,
}

#[wasm_bindgen]
pub fn hmac(
    key: Uint8Array,
    message: Uint8Array,
    algo: HashAlgorithm,
) -> Result<Box<[u8]>, JsValue> {
    let key_input_slice = unsafe {
        std::slice::from_raw_parts(key.byte_offset() as *const u8, key.length() as usize)
    };

    let message_input_slice = unsafe {
        std::slice::from_raw_parts(
            message.byte_offset() as *const u8,
            message.length() as usize,
        )
    };

    let result = match algo {
        HashAlgorithm::Md4 => {
            let mut mac = Hmac::<Md4>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Md5 => {
            let mut mac = Hmac::<Md5>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha1 => {
            let mut mac = Hmac::<Sha1>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            Mac::update(&mut mac, message_input_slice);
            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha224 => {
            let mut mac = Hmac::<Sha224>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha256 => {
            let mut mac = Hmac::<Sha256>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha384 => {
            let mut mac = Hmac::<Sha384>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            Mac::update(&mut mac, message_input_slice);
            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha512 => {
            let mut mac = Hmac::<Sha512>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha512_224 => {
            let mut mac = Hmac::<Sha512_224>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha512_256 => {
            let mut mac = Hmac::<Sha512_256>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha3_224 => {
            let mut mac = Hmac::<Sha3_224>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha3_256 => {
            let mut mac = Hmac::<Sha3_256>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha3_384 => {
            let mut mac = Hmac::<Sha3_384>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Sha3_512 => {
            let mut mac = Hmac::<Sha3_512>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Ripemd160 => {
            let mut mac = Hmac::<Ripemd160>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Ripemd256 => {
            let mut mac = Hmac::<Ripemd256>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Ripemd320 => {
            let mut mac = Hmac::<Ripemd320>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::Whirlpool => {
            let mut mac = Hmac::<Whirlpool>::new_from_slice(key_input_slice)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            
            Mac::update(&mut mac, message_input_slice);

            mac.finalize().into_bytes().to_vec()
        }
    };

    Ok(result.into_boxed_slice())
}

enum HmacInner {
    Md4(Hmac<Md4>),
    Md5(Hmac<Md5>),
    Sha1(Hmac<Sha1>),
    Sha224(Hmac<Sha224>),
    Sha256(Hmac<Sha256>),
    Sha384(Hmac<Sha384>),
    Sha512(Hmac<Sha512>),
    Sha512_224(Hmac<Sha512_224>),
    Sha512_256(Hmac<Sha512_256>),
    Sha3_224(Hmac<Sha3_224>),
    Sha3_256(Hmac<Sha3_256>),
    Sha3_384(Hmac<Sha3_384>),
    Sha3_512(Hmac<Sha3_512>),
    Ripemd160(Hmac<Ripemd160>),
    Ripemd256(Hmac<Ripemd256>),
    Ripemd320(Hmac<Ripemd320>),
    Whirlpool(Hmac<Whirlpool>),
}

#[wasm_bindgen]
pub struct StreamingHmac {
    inner: Option<HmacInner>,
}

#[wasm_bindgen]
impl StreamingHmac {
    #[wasm_bindgen(constructor)]
    pub fn new(key: Uint8Array, algo: HashAlgorithm) -> Result<StreamingHmac, JsValue> {
        let key_input_slice = unsafe {
            std::slice::from_raw_parts(key.byte_offset() as *const u8, key.length() as usize)
        };

        let inner = match algo {
            HashAlgorithm::Md4 => HmacInner::Md4(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Md5 => HmacInner::Md5(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha1 => HmacInner::Sha1(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha224 => HmacInner::Sha224(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha256 => HmacInner::Sha256(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha384 => HmacInner::Sha384(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha512 => HmacInner::Sha512(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha512_224 => HmacInner::Sha512_224(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha512_256 => HmacInner::Sha512_256(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha3_224 => HmacInner::Sha3_224(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha3_256 => HmacInner::Sha3_256(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha3_384 => HmacInner::Sha3_384(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha3_512 => HmacInner::Sha3_512(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Ripemd160 => HmacInner::Ripemd160(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Ripemd256 => HmacInner::Ripemd256(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Ripemd320 => HmacInner::Ripemd320(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Whirlpool => HmacInner::Whirlpool(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
        };
        Ok(StreamingHmac { inner: Some(inner) })
    }

    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let input_slice = unsafe {
            std::slice::from_raw_parts(input.byte_offset() as *const u8, input.length() as usize)
        };

        match self.inner.as_mut() {
            Some(HmacInner::Md4(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Md5(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha1(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha224(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha256(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha384(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha512(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha512_224(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha512_256(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha3_224(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha3_256(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha3_384(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha3_512(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Ripemd160(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Ripemd256(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Ripemd320(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Whirlpool(mac)) => Mac::update(mac, input_slice),
            None => return Err(JsValue::from_str("HMAC has been finalized")),
        }
        Ok(())
    }

    pub fn finalize(&mut self) -> Result<Box<[u8]>, JsValue> {
        let inner = self
            .inner
            .take()
            .ok_or_else(|| JsValue::from_str("Already finalized"))?;

        let result = match inner {
            HmacInner::Md4(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Md5(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha1(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha224(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha256(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha384(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha512(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha512_224(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha512_256(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha3_224(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha3_256(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha3_384(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha3_512(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Ripemd160(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Ripemd256(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Ripemd320(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Whirlpool(mac) => mac.finalize().into_bytes().to_vec(),
        };

        Ok(result.into_boxed_slice())
    }
}
