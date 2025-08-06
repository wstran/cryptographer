/* tslint:disable */
/* eslint-disable */
export function hmac(key: Uint8Array, message: Uint8Array, algo: HashAlgorithm): Uint8Array;
export enum HashAlgorithm {
  Md4 = 0,
  Md5 = 1,
  Sha1 = 2,
  Sha224 = 3,
  Sha256 = 4,
  Sha384 = 5,
  Sha512 = 6,
  Sha512_224 = 7,
  Sha512_256 = 8,
  Sha3_224 = 9,
  Sha3_256 = 10,
  Sha3_384 = 11,
  Sha3_512 = 12,
  Ripemd160 = 13,
  Ripemd256 = 14,
  Ripemd320 = 15,
  Whirlpool = 16,
}
export class StreamingHmac {
  free(): void;
  constructor(key: Uint8Array, algo: HashAlgorithm);
  update(input: Uint8Array): void;
  finalize(): Uint8Array;
}
