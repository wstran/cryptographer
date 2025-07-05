use blake3::Hasher;
use std::ffi::CStr;
use std::os::raw::{c_char, c_uchar, c_uint};
use std::ptr;

// Error codes
const ERR_NULL: c_uint = 0; // Null pointer
const ERR_EMPTY: c_uint = 1; // Empty input
const ERR_INVALID_KEY: c_uint = 2; // Invalid key length
const ERR_INVALID_DERIVE_KEY: c_uint = 3; // Invalid derive_key
const ERR_INVALID_LENGTH: c_uint = 4; // Invalid output length
const ERR_MISALIGNED: c_uint = 5; // Misaligned pointer

#[repr(C)]
pub struct HashOptions {
    keyed: *const c_uchar,
    keyed_len: c_uint,
    derive_key: *const c_char,
    hash_length: c_uint,
}

#[no_mangle]
pub extern "C" fn hash(input: *const c_uchar, input_len: c_uint, options: *const HashOptions, out: *mut c_uchar) -> c_uint {
    if input.is_null() || options.is_null() || out.is_null() {
        return ERR_NULL;
    }

    if input_len == 0 {
        return ERR_EMPTY;
    }

    if (input as usize) % 8 != 0 || (out as usize) % 8 != 0 {
        return ERR_MISALIGNED;
    }

    let input_slice = unsafe { std::slice::from_raw_parts(input, input_len as usize) };

    let opts = unsafe { &*options };

    let mut hasher = if !opts.keyed.is_null() && opts.keyed_len == 32 {
        let key_slice = unsafe { std::slice::from_raw_parts(opts.keyed, 32) };

        if (opts.keyed as usize) % 8 != 0 {
            return ERR_MISALIGNED;
        }

        let key: [u8; 32] = key_slice.try_into().unwrap_or([0; 32]);

        Hasher::new_keyed(&key)
    } else if opts.keyed_len != 0 {
        return ERR_INVALID_KEY;
    } else if !opts.derive_key.is_null() {
        match unsafe { CStr::from_ptr(opts.derive_key).to_str() } {
            Ok(s) if !s.is_empty() => Hasher::new_derive_key(s),
            _ => return ERR_INVALID_DERIVE_KEY,
        }
    } else {
        Hasher::new()
    };

    hasher.update(input_slice);

    let output_len = if opts.hash_length > 0 && opts.hash_length <= 1024 { opts.hash_length } else { 32 };

    if output_len > 1024 {
        return ERR_INVALID_LENGTH;
    }

    if output_len != 32 {
        let mut reader = hasher.finalize_xof();

        unsafe {
            reader.fill(std::slice::from_raw_parts_mut(out, output_len as usize));
        }

        output_len
    } else {
        let hash = hasher.finalize();

        unsafe {
            ptr::copy_nonoverlapping(hash.as_bytes().as_ptr(), out, 32);
        }

        32
    }
}

#[no_mangle]
pub extern "C" fn streaming_hasher_new(options: *const HashOptions) -> *mut Hasher {
    if options.is_null() {
        return ptr::null_mut();
    }

    let opts = unsafe { &*options };

    let hasher = if !opts.keyed.is_null() && opts.keyed_len == 32 {
        let key_slice = unsafe { std::slice::from_raw_parts(opts.keyed, 32) };

        if (opts.keyed as usize) % 8 != 0 {
            return ptr::null_mut();
        }

        let key: [u8; 32] = key_slice.try_into().unwrap_or([0; 32]);

        Hasher::new_keyed(&key)
    } else if opts.keyed_len != 0 {
        return ptr::null_mut();
    } else if !opts.derive_key.is_null() {
        match unsafe { CStr::from_ptr(opts.derive_key).to_str() } {
            Ok(s) if !s.is_empty() => Hasher::new_derive_key(s),
            _ => return ptr::null_mut(),
        }
    } else {
        Hasher::new()
    };

    Box::into_raw(Box::new(hasher))
}

#[no_mangle]
pub extern "C" fn streaming_hasher_update(hasher: *mut Hasher, data: *const c_uchar, data_len: c_uint) {
    if hasher.is_null() || data.is_null() || data_len == 0 {
        return;
    }

    if (data as usize) % 8 != 0 {
        return;
    }

    let hasher = unsafe { &mut *hasher };

    let data_slice = unsafe { std::slice::from_raw_parts(data, data_len as usize) };

    hasher.update(data_slice);
}

#[no_mangle]
pub extern "C" fn streaming_hasher_finalize(hasher: *const Hasher, out: *mut c_uchar) -> c_uint {
    if hasher.is_null() || out.is_null() {
        return ERR_NULL;
    }

    if (out as usize) % 8 != 0 {
        return ERR_MISALIGNED;
    }

    let hasher = unsafe { &*hasher };

    let hash = hasher.finalize();

    unsafe {
        ptr::copy_nonoverlapping(hash.as_bytes().as_ptr(), out, 32);
    }

    32
}

#[no_mangle]
pub extern "C" fn streaming_hasher_finalize_xof(hasher: *const Hasher, length: c_uint, out: *mut c_uchar) -> c_uint {
    if hasher.is_null() || out.is_null() || length == 0 || length > 1024 {
        return ERR_NULL;
    }

    if (out as usize) % 8 != 0 {
        return ERR_MISALIGNED;
    }

    let hasher = unsafe { &*hasher };

    let mut reader = hasher.finalize_xof();

    unsafe {
        reader.fill(std::slice::from_raw_parts_mut(out, length as usize));
    }
    
    length
}

#[no_mangle]
pub extern "C" fn streaming_hasher_free(hasher: *mut Hasher) {
    if !hasher.is_null() {
        unsafe { let _ = Box::from_raw(hasher); }
    }
}