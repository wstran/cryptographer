/* tslint:disable */
/* eslint-disable */
export function hash(input: Uint8Array, options: any): Uint8Array;
export class StreamingHasher {
  free(): void;
  constructor(options: any);
  update(data: Uint8Array): void;
  finalize(): Uint8Array;
  finalize_xof(length: number): Uint8Array;
}
