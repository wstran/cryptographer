export enum DesAlgorithm {
  DesCbc,
  TdesCbc,
  DesCtr,
  TdesCtr
}

export function encrypt(
  plaintext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  algo: DesAlgorithm
): Uint8Array;

export function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  algo: DesAlgorithm
): Uint8Array;
