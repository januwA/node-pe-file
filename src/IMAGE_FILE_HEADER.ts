import { PE_FILE_BASE } from "./PE_FILE_BASE";
import { WORD, DWORD } from "./types";

/**
struct _IMAGE_FILE_HEADER {
  0x00 WORD Machine;
  0x02 WORD NumberOfSections;
  0x04 DWORD TimeDateStamp;
  0x08 DWORD PointerToSymbolTable;
  0x0c DWORD NumberOfSymbols;
  0x10 WORD SizeOfOptionalHeader;
  0x12 WORD Characteristics;
};
 */
export class IMAGE_FILE_HEADER extends PE_FILE_BASE {
  static size = 0x14; // 20
  /**
   * 机器类型
   *
   * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#machine-types
   */
  Machine: Buffer;

  /**
   * 节表的数量，节表紧随标题之后。
   *
   * 文件中节的总数，如果要增加或合并 需要修改这个值
   */
  NumberOfSections: Buffer;

  /**
   * 自1970年1月1日00:00以来的秒数的低32位（C运行时time_t值），它指示文件的创建时间。
   */
  TimeDateStamp: Buffer;
  PointerToSymbolTable: Buffer;
  NumberOfSymbols: Buffer;

  /**
   * 可选头(IMAGE_OPTIONAL_HEADER)的大小，对于可执行文件是必需的，但对于目标文件不是必需的。
   *
   * 对于目标文件，该值应为零。 有关标题格式的说明，请参见可选标题。
   *
   * x86 PE文件默认0xE0
   *
   * x64 PE文件默认0xF0
   *
   * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#optional-header-image-only
   */
  SizeOfOptionalHeader: Buffer;

  /**
   * 指示文件属性的标志。 有关特定标志值，请参见特性。
   *
   * 每一位代表不同信息
   *
   * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#characteristics
   */
  Characteristics: Buffer;

  constructor(data: Buffer, offset: number) {
    super(data, offset);

    this.Machine = this._readByte(WORD);
    this.NumberOfSections = this._readByte(WORD);
    this.TimeDateStamp = this._readByte(DWORD);
    this.PointerToSymbolTable = this._readByte(DWORD);
    this.NumberOfSymbols = this._readByte(DWORD);
    this.SizeOfOptionalHeader = this._readByte(WORD);
    this.Characteristics = this._readByte(WORD);
  }
}

