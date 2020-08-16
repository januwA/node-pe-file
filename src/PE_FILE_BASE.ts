import { readByte } from "./tools";

export abstract class PE_FILE_BASE {
  #data: Buffer;

  constructor(data: Buffer, public offset: number) {
    this.#data = data;
  }

  _readByte(size: number) {
    const r = readByte(this.#data, this.offset, size);
    this.offset += size;
    return r;
  }
}
