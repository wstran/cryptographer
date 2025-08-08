export enum ChaCha20Algorithm {
  Chacha20,
  Chacha20Poly1305
}

export function encrypt(
  plaintext: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array,
  algo: ChaCha20Algorithm
): Uint8Array;

export function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array,
  algo: ChaCha20Algorithm
): Uint8Array;
