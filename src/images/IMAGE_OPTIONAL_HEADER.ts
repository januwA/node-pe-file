import { PE_FILE_BASE } from "../PE_FILE_BASE";
import { WORD_t, DWORD_t, BYTE_t, QWORD_t } from "../types";
import { IMAGE_DATA_DIRECTORY } from "./IMAGE_DATA_DIRECTORY";
import { isX64PE } from "../pe-tools";

/**
struct _IMAGE_OPTIONAL_HEADER {
  0x00 WORD Magic;
  0x02 BYTE MajorLinkerVersion;
  0x03 BYTE MinorLinkerVersion;
  0x04 DWORD SizeOfCode;
  0x08 DWORD SizeOfInitializedData;
  0x0c DWORD SizeOfUninitializedData;
  0x10 DWORD AddressOfEntryPoint;
  0x14 DWORD BaseOfCode;
  0x18 DWORD BaseOfData;
  0x1c DWORD/QWORD ImageBase;
  0x20 DWORD SectionAlignment;
  0x24 DWORD FileAlignment;
  0x28 WORD MajorOperatingSystemVersion;
  0x2a WORD MinorOperatingSystemVersion;
  0x2c WORD MajorImageVersion;
  0x2e WORD MinorImageVersion;
  0x30 WORD MajorSubsystemVersion;
  0x32 WORD MinorSubsystemVersion;
  0x34 DWORD Win32VersionValue;
  0x38 DWORD SizeOfImage;
  0x3c DWORD SizeOfHeaders;
  0x40 DWORD CheckSum;
  0x44 WORD Subsystem;
  0x46 WORD DllCharacteristics;
  0x48 DWORD/QWORD SizeOfStackReserve;
  0x4c DWORD/QWORD SizeOfStackCommit;
  0x50 DWORD/QWORD SizeOfHeapReserve;
  0x54 DWORD/QWORD SizeOfHeapCommit;
  0x58 DWORD LoaderFlags;
  0x5c DWORD NumberOfRvaAndSizes;
  0x60 _IMAGE_DATA_DIRECTORY DataDirectory[16];
};
 */
export class IMAGE_OPTIONAL_HEADER extends PE_FILE_BASE {
  /**
   * ! 注意：IMAGE_OPTIONAL_HEADER的大小不是固定的。
   *
   * ! 你始终因该使用[image_file_header.SizeOfOptionalHeader]来获取IMAGE_OPTIONAL_HEADER的大小
   *
   */
  static size = 0;

  /**
   * 标识图像文件状态的无符号整数。 最常见的数字是0x10B，将其标识为普通的可执行文件。 0x107将其标识为ROM映像，而0x20B将其标识为PE32+ 可执行文件。
   */
  Magic: Buffer;
  MajorLinkerVersion: Buffer;
  MinorLinkerVersion: Buffer;
  SizeOfCode: Buffer;
  SizeOfInitializedData: Buffer;
  SizeOfUninitializedData: Buffer;

  /**
   * 程序入口地址
   *
   * 当可执行文件被加载到内存中时，相对于映像库的入口点的地址。
   *
   * 对于程序映像，这是起始地址。
   *
   * 对于设备驱动程序，这是初始化函数的地址。
   *
   * DLL的入口点是可选的。
   *
   * 如果不存在任何入口点，则此字段必须为零。
   */
  AddressOfEntryPoint: Buffer;
  BaseOfCode: Buffer;

  /**
   * PE32包含此附加字段，在BaseOfCode之后，PE32 +中不存在。
   */
  BaseOfData?: Buffer;

  /**
   * 图像的第一个字节的首选地址，当加载到内存时； 必须是64K的倍数。
   *
   * DLL的默认值为0x10000000。
   *
   * Windows CE EXE的默认值为0x00010000。
   *
   * Windows NT，Windows 2000，Windows XP，Windows 95，Windows 98和Windows Me的默认值为0x00400000。
   */
  ImageBase: Buffer;

  /**
   * 内存对齐
   *
   * 将节加载到内存中时的对齐方式（以字节为单位）。 它必须大于或等于FileAlignment。 默认值为体系结构的页面大小。
   */
  SectionAlignment: Buffer;

  /**
   * 文件对齐
   *
   * 文件对齐（以字节为单位），用于对齐图像文件中各节的原始数据。 该值应为512到64 K（含）之间的2的幂。 默认值为512。如果SectionAlignment小于体系结构的页面大小，则FileAlignment必须匹配SectionAlignment。
   */
  FileAlignment: Buffer;
  MajorOperatingSystemVersion: Buffer;
  MinorOperatingSystemVersion: Buffer;
  MajorImageVersion: Buffer;
  MinorImageVersion: Buffer;
  MajorSubsystemVersion: Buffer;
  MinorSubsystemVersion: Buffer;
  Win32VersionValue: Buffer;

  /**
   * 当图像加载到内存中时，图像的大小（以字节为单位）,
   * 包括所有标头。 它必须是SectionAlignment的倍数。
   *
   * 通常这个大小是：dos头大小 + 标准头大小 + 可选头大小 + 对齐的节表大小的总和
   */
  SizeOfImage: Buffer;

  /**
   * dos头，PE标头和节标头的组合大小四舍五入为FileAlignment的倍数。
   */
  SizeOfHeaders: Buffer;

  CheckSum: Buffer;
  Subsystem: Buffer;
  DllCharacteristics: Buffer;
  SizeOfStackReserve: Buffer;
  SizeOfStackCommit: Buffer;
  SizeOfHeapReserve: Buffer;
  SizeOfHeapCommit: Buffer;
  LoaderFlags: Buffer;

  /**
   * 剩余节数量
   *
   * 可选头其余部分中的数据目录条目数。 每个描述一个位置和大小。
   */
  NumberOfRvaAndSizes: Buffer;

  DataDirectory: IMAGE_DATA_DIRECTORY[] = [];

  constructor(data: Buffer, offset: number) {
    super(data, offset);

    const bX64 = isX64PE(IMAGE_OPTIONAL_HEADER.size);

    this.Magic = this._readByte(WORD_t);
    this.MajorLinkerVersion = this._readByte(BYTE_t);
    this.MinorLinkerVersion = this._readByte(BYTE_t);
    this.SizeOfCode = this._readByte(DWORD_t);

    this.SizeOfInitializedData = this._readByte(DWORD_t);
    this.SizeOfUninitializedData = this._readByte(DWORD_t);

    this.AddressOfEntryPoint = this._readByte(DWORD_t);
    this.BaseOfCode = this._readByte(DWORD_t);
    if (!bX64) this.BaseOfData = this._readByte(DWORD_t);
    this.ImageBase = this._readByte(bX64 ? QWORD_t : DWORD_t);
    this.SectionAlignment = this._readByte(DWORD_t);
    this.FileAlignment = this._readByte(DWORD_t);
    this.MajorOperatingSystemVersion = this._readByte(WORD_t);
    this.MinorOperatingSystemVersion = this._readByte(WORD_t);
    this.MajorImageVersion = this._readByte(WORD_t);
    this.MinorImageVersion = this._readByte(WORD_t);
    this.MajorSubsystemVersion = this._readByte(WORD_t);
    this.MinorSubsystemVersion = this._readByte(WORD_t);
    this.Win32VersionValue = this._readByte(DWORD_t);
    this.SizeOfImage = this._readByte(DWORD_t);
    this.SizeOfHeaders = this._readByte(DWORD_t);
    this.CheckSum = this._readByte(DWORD_t);
    this.Subsystem = this._readByte(WORD_t);

    this.DllCharacteristics = this._readByte(WORD_t);
    this.SizeOfStackReserve = this._readByte(bX64 ? QWORD_t : DWORD_t);
    this.SizeOfStackCommit = this._readByte(bX64 ? QWORD_t : DWORD_t);
    this.SizeOfHeapReserve = this._readByte(bX64 ? QWORD_t : DWORD_t);
    this.SizeOfHeapCommit = this._readByte(bX64 ? QWORD_t : DWORD_t);
    this.LoaderFlags = this._readByte(DWORD_t);

    this.NumberOfRvaAndSizes = this._readByte(DWORD_t);
    for (let i = 0; i < 16; i++) {
      const image_data_directory = new IMAGE_DATA_DIRECTORY(data, this.offset);
      this.DataDirectory.push(image_data_directory);
      this.offset = image_data_directory.offset;
    }
  }
}
