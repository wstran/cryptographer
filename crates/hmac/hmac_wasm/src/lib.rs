use hmac::{Hmac, Mac};
use js_sys::Uint8Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

use md5::Md5;
use sha1::Sha1;
use sha2::{Sha256, Sha512};
use sha3::{Sha3_256, Sha3_512};

#[wasm_bindgen]
#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum HashAlgorithm {
    Md5,
    Sha1,
    Sha256,
    Sha512,
    Sha3_256,
    Sha3_512,
}

#[wasm_bindgen]
pub fn hmac(
    key: Uint8Array,
    message: Uint8Array,
    algo: HashAlgorithm,
) -> Result<Box<[u8]>, JsValue> {
    let key_offset = key.byte_offset() as usize;

    let key_len = key.length() as usize;

    let key_ptr = key_offset as *const u8;

    let key_input_slice = unsafe { std::slice::from_raw_parts(key_ptr, key_len) };

    let message_offset = message.byte_offset() as usize;

    let message_len = message.length() as usize;

    let message_ptr = message_offset as *const u8;

    let message_input_slice = unsafe { std::slice::from_raw_parts(message_ptr, message_len) };

    let result = match algo {
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
        HashAlgorithm::Sha256 => {
            let mut mac = Hmac::<Sha256>::new_from_slice(key_input_slice)
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
        HashAlgorithm::Sha3_256 => {
            let mut mac = Hmac::<Sha3_256>::new_from_slice(key_input_slice)
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
    };

    Ok(result.into_boxed_slice())
}

enum HmacInner {
    Md5(Hmac<Md5>),
    Sha1(Hmac<Sha1>),
    Sha256(Hmac<Sha256>),
    Sha512(Hmac<Sha512>),
    Sha3_256(Hmac<Sha3_256>),
    Sha3_512(Hmac<Sha3_512>),
}

#[wasm_bindgen]
pub struct StreamingHmac {
    inner: Option<HmacInner>,
}

#[wasm_bindgen]
impl StreamingHmac {
    #[wasm_bindgen(constructor)]
    pub fn new(key: Uint8Array, algo: HashAlgorithm) -> Result<StreamingHmac, JsValue> {
        let key_offset = key.byte_offset() as usize;

        let key_len = key.length() as usize;

        let key_ptr = key_offset as *const u8;

        let key_input_slice = unsafe { std::slice::from_raw_parts(key_ptr, key_len) };

        let inner = match algo {
            HashAlgorithm::Md5 => HmacInner::Md5(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha1 => HmacInner::Sha1(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha256 => HmacInner::Sha256(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha512 => HmacInner::Sha512(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha3_256 => HmacInner::Sha3_256(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
            HashAlgorithm::Sha3_512 => HmacInner::Sha3_512(
                Hmac::new_from_slice(key_input_slice)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?,
            ),
        };
        Ok(StreamingHmac { inner: Some(inner) })
    }

    pub fn update(&mut self, input: Uint8Array) -> Result<(), JsValue> {
        let offset = input.byte_offset() as usize;

        let len = input.length() as usize;

        let ptr = offset as *const u8;

        let input_slice = unsafe { std::slice::from_raw_parts(ptr, len) };

        match self.inner.as_mut() {
            Some(HmacInner::Md5(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha1(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha256(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha512(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha3_256(mac)) => Mac::update(mac, input_slice),
            Some(HmacInner::Sha3_512(mac)) => Mac::update(mac, input_slice),
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
            HmacInner::Md5(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha1(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha256(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha512(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha3_256(mac) => mac.finalize().into_bytes().to_vec(),
            HmacInner::Sha3_512(mac) => mac.finalize().into_bytes().to_vec(),
        };
        Ok(result.into_boxed_slice())
    }
}
