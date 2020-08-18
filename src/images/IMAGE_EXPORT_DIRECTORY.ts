import { PE_FILE } from "../node-pe-file";
import { IMAGE_DIRECTORY_ENTRY_EXPORT_INDEX, DWORD_t, WORD_t } from "../types";
import { RVA2FOA, readASCII } from "../pe-tools";
import { buffer2dec, buffer2hex } from "../tools";
import { PE_FILE_BASE } from "../PE_FILE_BASE";

/**
 * 
   ```
    const pe = new PE_FILE(data);
    const ed = CREATE_IMAGE_EXPORT_DIRECTORY(pe, data);
  ```
 * @param pe 
 * @param data 
 */
export function CREATE_IMAGE_EXPORT_DIRECTORY(pe: PE_FILE, data: Buffer) {
  const exportData =
    pe.image_nt_headers.image_optional_header.DataDirectory[
      IMAGE_DIRECTORY_ENTRY_EXPORT_INDEX
    ];

  // file offset addreass
  const foa = RVA2FOA(pe, exportData.VirtualAddress);
  return new IMAGE_EXPORT_DIRECTORY(data, foa);
}

/**
 * 
 * 导出表数据，未经任何处理，你可能还需要[IMAGE_EXPORT_DIRECTORY_PARSE]
 * 
struct _IMAGE_EXPORT_DIRECTORY {
  0x00 DWORD Characteristics;
  0x04 DWORD TimeDateStamp;
  0x08 WORD MajorVersion;
  0x0a WORD MinorVersion;
  0x0c DWORD Name;
  0x10 DWORD Base;
  0x14 DWORD NumberOfFunctions;
  0x18 DWORD NumberOfNames;
  0x1c DWORD AddressOfFunctions;
  0x20 DWORD AddressOfNames;
  0x24 DWORD AddressOfNameOrdinals;
};
 */
export class IMAGE_EXPORT_DIRECTORY extends PE_FILE_BASE {
  static size = 0x28; // 40

  Characteristics: Buffer;
  TimeDateStamp: Buffer;
  MajorVersion: Buffer;
  MinorVersion: Buffer;

  /**
   * 包含DLL名称的ASCII字符串的地址。RVA
   */
  Name: Buffer;

  /**
   * 此图像中导出的起始序号。该字段指定导出地址表的起始序号。通常设置为1
   */
  Base: Buffer;

  /**
   * 导出函数数量[AddressOfFunctions]
   */
  NumberOfFunctions: Buffer;

  /**
   * 以函数名称导出的指针数量[AddressOfNames]
   */
  NumberOfNames: Buffer;

  /**
   * 导出地址表 RVA
   */
  AddressOfFunctions: Buffer;

  /**
   * 名称指针 RVA
   */
  AddressOfNames: Buffer;

  /**
   * 序号表的地址 RVA
   */
  AddressOfNameOrdinals: Buffer;

  constructor(data: Buffer, offset: number) {
    super(data, offset);
    this.Characteristics = this._readByte(DWORD_t);
    this.TimeDateStamp = this._readByte(DWORD_t);
    this.MajorVersion = this._readByte(WORD_t);
    this.MinorVersion = this._readByte(WORD_t);
    this.Name = this._readByte(DWORD_t);
    this.Base = this._readByte(DWORD_t);
    this.NumberOfFunctions = this._readByte(DWORD_t);
    this.NumberOfNames = this._readByte(DWORD_t);
    this.AddressOfFunctions = this._readByte(DWORD_t);
    this.AddressOfNames = this._readByte(DWORD_t);
    this.AddressOfNameOrdinals = this._readByte(DWORD_t);
  }
}

/**
 * 解析 IMAGE_EXPORT_DIRECTORY
 * 
 * ```
    const pe = new PE_FILE(data);
    const ed = CREATE_IMAGE_EXPORT_DIRECTORY(pe, data);
    const edp =  new IMAGE_EXPORT_DIRECTORY_PARSE(pe, ed, data);
    console.log(edp.exports);
 * ```
 */
export class IMAGE_EXPORT_DIRECTORY_PARSE {
  Characteristics: Buffer;
  TimeDateStamp: Buffer;
  MajorVersion: Buffer;
  MinorVersion: Buffer;

  /**
   * 包含DLL名称的ASCII字符串的地址。此地址是相对于图像库的。
   */
  Name: Buffer;

  /**
   * 此图像中导出的起始序号。该字段指定导出地址表的起始序号。通常设置为1
   */
  Base: Buffer;

  /**
   * 导出函数数量[AddressOfFunctions]
   */
  NumberOfFunctions: Buffer;

  /**
   * 名称指针数量[AddressOfNames]
   */
  NumberOfNames: Buffer;

  /**
   * 导出地址表 VA
   */
  AddressOfFunctions: Buffer[] = [];

  /**
   * 名称
   */
  AddressOfNames: {
    va_offset: number;
    offset: number;
    ascii: Buffer;
  }[] = [];

  /**
   * 序号表的地址，相对于图像库
   */
  AddressOfNameOrdinals: Buffer[] = [];

  /**
   * 提供便于阅读的属性
   *
   * ! 注：PE头中并没有此属性
   */
  exports: {
    foa_address_dec: number;
    foa_address_hex: string;
    name: string;
  }[] = [];

  /**
   * 根据序号找到函数地址
   */
  getAddressOfFunctions(index: number) {
    return this.AddressOfFunctions[index - buffer2dec(this.Base)];
  }

  constructor(pe: PE_FILE, ied: IMAGE_EXPORT_DIRECTORY, data: Buffer) {
    this.Characteristics = ied.Characteristics;
    this.TimeDateStamp = ied.TimeDateStamp;
    this.MajorVersion = ied.MajorVersion;
    this.MinorVersion = ied.MajorVersion;

    this.Name = readASCII(data, RVA2FOA(pe, ied.Name));

    this.Base = ied.Base;
    this.NumberOfFunctions = ied.NumberOfFunctions;
    this.NumberOfNames = ied.NumberOfNames;

    this.p_AddressOfFunctions(pe, ied, data);
    this.p_AddressOfNames(pe, ied, data);
    this.p_AddressOfNameOrdinals(pe, ied, data);

    this.AddressOfNames.forEach((aon, i) => {
      const addr = this.AddressOfFunctions[
        buffer2dec(this.AddressOfNameOrdinals[i])
      ];
      this.exports.push({
        foa_address_hex: "0x" + buffer2hex(addr),
        foa_address_dec: buffer2dec(addr),
        name: aon.ascii.toString(),
      });
    });
  }

  /**
   * 解析 AddressOfNames
   *
   * @param pe
   * @param ied
   * @param data
   */
  private p_AddressOfNames(
    pe: PE_FILE,
    ied: IMAGE_EXPORT_DIRECTORY,
    data: Buffer
  ) {
    // 先获列表的地址
    let AddressOfNamesOffset = RVA2FOA(pe, ied.AddressOfNames);

    // 在获取列表中的每个名称的虚拟地址
    const VA_names = [];
    for (let i = 0; i < buffer2dec(this.NumberOfNames); i++) {
      VA_names.push(data.readUInt32LE(AddressOfNamesOffset));
      AddressOfNamesOffset += DWORD_t;
    }

    // 将虚拟地址转成文件地址，在获取函数名
    this.AddressOfNames = VA_names.map((va_nameOffset) => {
      const nameOffset = RVA2FOA(pe, va_nameOffset);
      return {
        va_offset: va_nameOffset,
        offset: nameOffset,
        ascii: readASCII(data, nameOffset),
      };
    });
  }

  /**
   * 解析 AddressOfFunctions
   * @param pe
   * @param ied
   * @param data
   */
  private p_AddressOfFunctions(
    pe: PE_FILE,
    ied: IMAGE_EXPORT_DIRECTORY,
    data: Buffer
  ) {
    // 先获列表的地址
    let AddressOfFunctionsOffset = RVA2FOA(pe, ied.AddressOfFunctions);

    // 在获取列表中,每个函数的地址
    for (let i = 0; i < buffer2dec(this.NumberOfFunctions); i++) {
      const buf = Buffer.alloc(DWORD_t);
      buf.writeInt32LE(data.readUInt32LE(AddressOfFunctionsOffset), 0);
      this.AddressOfFunctions.push(buf);
      AddressOfFunctionsOffset += DWORD_t;
    }
  }

  /**
   * 解析 AddressOfNameOrdinals
   * @param pe
   * @param ied
   * @param data
   */
  private p_AddressOfNameOrdinals(
    pe: PE_FILE,
    ied: IMAGE_EXPORT_DIRECTORY,
    data: Buffer
  ) {
    // 先获列表的地址
    let AddressOfNameOrdinalsOffset = RVA2FOA(pe, ied.AddressOfNameOrdinals);

    for (let i = 0; i < buffer2dec(this.NumberOfNames); i++) {
      const buf = Buffer.alloc(WORD_t);

      data.copy(
        buf,
        0,
        AddressOfNameOrdinalsOffset,
        AddressOfNameOrdinalsOffset + WORD_t
      );
      this.AddressOfNameOrdinals.push(buf);
      AddressOfNameOrdinalsOffset += WORD_t;
    }
  }
}
