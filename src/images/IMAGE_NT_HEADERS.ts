import { PE_FILE_BASE } from "../PE_FILE_BASE";
import { IMAGE_FILE_HEADER } from "./IMAGE_FILE_HEADER";
import { IMAGE_OPTIONAL_HEADER } from "./IMAGE_OPTIONAL_HEADER";
import { DWORD_t } from "../types";

/**
struct _IMAGE_NT_HEADERS {
  0x00 DWORD Signature;
  0x04 _IMAGE_FILE_HEADER FileHeader;
  0x18 _IMAGE_OPTIONAL_HEADER OptionalHeader;
};
 */
export class IMAGE_NT_HEADERS extends PE_FILE_BASE {
  /**
   * PE 标记
   */
  Signature: Buffer;

  /**
   * 标准头
   */
  image_file_header: IMAGE_FILE_HEADER;

  /**
   * 可选头
   */
  image_optional_header: IMAGE_OPTIONAL_HEADER;

  constructor(data: Buffer, offset: number) {
    super(data, offset);

    this.Signature = this._readByte(DWORD_t);

    this.image_file_header = new IMAGE_FILE_HEADER(data, this.offset);
    this.offset = this.image_file_header.offset;

    this.image_optional_header = new IMAGE_OPTIONAL_HEADER(data, this.offset);
    this.offset = this.image_optional_header.offset;
  }
}
