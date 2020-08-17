// https://docs.microsoft.com/en-us/windows/win32/debug/pe-format
// http://www.openrce.org/reference_library/files/reference/PE%20Format.pdf

import { IMAGE_DOS_HEADER } from "./IMAGE_DOS_HEADER";
import { IMAGE_NT_HEADERS } from "./IMAGE_NT_HEADERS";
import { IMAGE_SECTION_HEADER } from "./IMAGE_SECTION_HEADER";
import { buffer2dec } from "./tools";

/**
 * const pe = new PE_FILE(data);
 */
export class PE_FILE {
  offset = 0;

  /**
   * dos头
   */
  image_dos_header: IMAGE_DOS_HEADER;

  /**
   * nt 头
   */
  image_nt_headers: IMAGE_NT_HEADERS;

  /**
   * 节表
   */
  image_section_headers: IMAGE_SECTION_HEADER[] = [];

  constructor(data: Buffer) {

    // 获取dos头
    this.image_dos_header = new IMAGE_DOS_HEADER(data, this.offset);
    //assert(this.image_dos_header.offset - DWORD == 0x3c);
    //assert(this.image_dos_header.e_magic.toString("utf-8"), "MZ");

    // 获取NT头起始位置
    this.offset = buffer2dec(this.image_dos_header.e_lfanew);

    this.image_nt_headers = new IMAGE_NT_HEADERS(data, this.offset);
    // assert(this.image_nt_headers.Signature.toString("utf-8"), "PE");

    // 获取节表offset
    let image_section_header_offset =
      this.image_nt_headers.image_file_header.offset +
      buffer2dec(this.image_nt_headers.image_file_header.SizeOfOptionalHeader);

    // 获取共有几个节表
    const image_section_header_length = buffer2dec(
      this.image_nt_headers.image_file_header.NumberOfSections
    );

    for (let i = 0; i < image_section_header_length; i++) {
      const image_section_header = new IMAGE_SECTION_HEADER(
        data,
        image_section_header_offset
      );
      this.image_section_headers.push(image_section_header);
      image_section_header_offset = image_section_header.offset;
    }
    this.offset = image_section_header_offset;
  }
}
