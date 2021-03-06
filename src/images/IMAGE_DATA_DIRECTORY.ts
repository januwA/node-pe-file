import { PE_FILE_BASE } from "../PE_FILE_BASE";
import { DWORD_t } from "../types";

/**
struct _IMAGE_DATA_DIRECTORY {
  0x00 DWORD VirtualAddress;
  0x04 DWORD Size;
}
 */
export class IMAGE_DATA_DIRECTORY extends PE_FILE_BASE {
  static size = 0x8;
  
  /**
   * ! VirtualAddress RVA
   */
  VirtualAddress: Buffer;
  Size: Buffer;
  constructor(data: Buffer, offset: number) {
    super(data, offset);
    this.VirtualAddress = this._readByte(DWORD_t);
    this.Size = this._readByte(DWORD_t);
  }
}
