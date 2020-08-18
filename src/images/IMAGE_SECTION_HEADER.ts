import { PE_FILE_BASE } from "../PE_FILE_BASE";
import { IMAGE_SIZEOF_SHORT_NAME_t, DWORD_t, WORD_t } from "../types";

/**
typedef struct _IMAGE_SECTION_HEADER {
  0x00 BYTE Name[IMAGE_SIZEOF_SHORT_NAME];
  union {
  0x08 DWORD PhysicalAddress;
  0x08 DWORD VirtualSize;
  } Misc;
  0x0c DWORD VirtualAddress;
  0x10 DWORD SizeOfRawData;
  0x14 DWORD PointerToRawData;
  0x18 DWORD PointerToRelocations;
  0x1c DWORD PointerToLinenumbers;
  0x20 WORD NumberOfRelocations;
  0x22 WORD NumberOfLinenumbers;
  0x24 DWORD Characteristics;
};

https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#section-table-section-headers
 */
export class IMAGE_SECTION_HEADER extends PE_FILE_BASE {
  static size = 0x28; // 40

  /**
   * 节的名字,8字节
   */
  Name: Buffer;

  /**
   * 加载到内存对齐前的实际大小
   *
   * 如果此值大于SizeOfRawData，则将该部分填充零。
   *
   * 该字段仅对可执行映像有效，并且对于目标文件应设置为零。
   */
  Misc: IMAGE_SECTION_HEADER_MISC;

  /**
   * 节在内存中的偏移
   *
   * 对于可执行映像，当该段被加载到内存中时，该段的第一个字节相对于映像库的地址。
   *
   * 对于目标文件，此字段是应用重定位之前的第一个字节的地址；为简单起见，编译器应将此设置为零。否则，它是在重定位期间从偏移量中减去的任意值。
   */
  VirtualAddress: Buffer;

  /**
   * 加载到内存对齐后的实际大小
   *
   * 节的大小（对于目标文件）或磁盘上初始化的数据的大小（对于图像文件）。
   * 对于可执行映像，它必须是可选标头中FileAlignment的倍数。
   * 如果小于VirtualSize，则该部分的其余部分为零。由于SizeOfRawData字段是四舍五入的，而VirtualSize字段不是四舍五入的，因此SizeOfRawData也可能大于VirtualSize。
   *
   * 当节仅包含未初始化的数据时，此字段应为零。
   */
  SizeOfRawData: Buffer;

  /**
   * 节在文件中的偏移
   *
   * 指向COFF文件中该部分首页的文件指针。对于可执行映像，它必须是可选标头中FileAlignment的倍数。
   * 对于目标文件，该值应在4字节边界上对齐以获得最佳性能。当节仅包含未初始化的数据时，此字段应为零。
   */
  PointerToRawData: Buffer;

  /**
   * 指向该部分的重定位条目开头的文件指针。对于可执行映像或没有重定位，此值设置为零。
   */
  PointerToRelocations: Buffer;

  /**
   * 指向该部分行号条目开头的文件指针。如果没有COFF行号，则将其设置为零。对于图像，此值应为零，因为不建议使用COFF调试信息。
   */
  PointerToLinenumbers: Buffer;

  /**
   * 该部分的重定位条目数。对于可执行映像，它设置为零。
   */
  NumberOfRelocations: Buffer;

  /**
   * 该部分的行号条目数。
   *
   * 对于图像，此值应为零，因为不建议使用COFF调试信息。
   */
  NumberOfLinenumbers: Buffer;

  /**
   * 描述该部分特征的标志。
   *
   * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#section-flags
   */
  Characteristics: Buffer;

  constructor(data: Buffer, offset: number) {
    super(data, offset);
    this.Name = this._readByte(IMAGE_SIZEOF_SHORT_NAME_t);
    const Misc = this._readByte(DWORD_t);
    this.Misc = new IMAGE_SECTION_HEADER_MISC(Misc);
    this.VirtualAddress = this._readByte(DWORD_t);
    this.SizeOfRawData = this._readByte(DWORD_t);
    this.PointerToRawData = this._readByte(DWORD_t);
    this.PointerToRelocations = this._readByte(DWORD_t);
    this.PointerToLinenumbers = this._readByte(DWORD_t);
    this.NumberOfRelocations = this._readByte(WORD_t);
    this.NumberOfLinenumbers = this._readByte(WORD_t);
    this.Characteristics = this._readByte(DWORD_t);
  }
}

export class IMAGE_SECTION_HEADER_MISC {
  static size = 0x8;

  PhysicalAddress: Buffer;
  VirtualSize: Buffer;
  constructor(data: Buffer) {
    this.PhysicalAddress = data;
    this.VirtualSize = data;
  }
}
