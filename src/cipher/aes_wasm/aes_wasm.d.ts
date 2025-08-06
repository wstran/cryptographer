/* tslint:disable */
/* eslint-disable */
export function encrypt(plaintext: Uint8Array, key: Uint8Array, nonce_or_iv: Uint8Array, algo: AesAlgorithm): Uint8Array;
export function decrypt(ciphertext: Uint8Array, key: Uint8Array, nonce_or_iv: Uint8Array, algo: AesAlgorithm): Uint8Array;
export enum AesAlgorithm {
  Aes128Gcm = 0,
  Aes192Gcm = 1,
  Aes256Gcm = 2,
  Aes128Ctr = 3,
  Aes192Ctr = 4,
  Aes256Ctr = 5,
  Aes128Ccm = 6,
  Aes192Ccm = 7,
  Aes256Ccm = 8,
  Aes128Siv = 9,
  Aes256Siv = 10,
}
