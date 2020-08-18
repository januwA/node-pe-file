import { PE_FILE_BASE } from "../PE_FILE_BASE";
import { PE_FILE } from "../node-pe-file";
import {
  IMAGE_DIRECTORY_ENTRY_IMPORT_INDEX,
  DWORD_t,
  QWORD_t,
  WORD_t,
} from "../types";
import {
  buffer2dec,
  readByte,
  getBitIndex,
  toBit,
  getBitRange,
  buffer2hex,
} from "../tools";
import { RVA2FOA, readASCII, isX64PE } from "../pe-tools";

export function CREATE_IMAGE_DIRECTORY_ENTRY_IMPORT(pe: PE_FILE, data: Buffer) {
  const importTable =
    pe.image_nt_headers.image_optional_header.DataDirectory[
      IMAGE_DIRECTORY_ENTRY_IMPORT_INDEX
    ];

  let offset = RVA2FOA(pe, importTable.VirtualAddress);

  const r: IMAGE_DIRECTORY_ENTRY_IMPORT[] = [];
  if (offset === 0) return r;

  while (true) {
    if (
      buffer2dec(readByte(data, offset, IMAGE_DIRECTORY_ENTRY_IMPORT.size)) ===
      0
    )
      break;
    const it = new IMAGE_DIRECTORY_ENTRY_IMPORT(data, offset);
    r.push(it);
    offset = it.offset;
  }
  return r;
}

/**
 * 导入目录表
 * 
 * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#import-directory-table
 * 
 * ```
struct _IMAGE_IMPORT_DESCRIPTOR {

  0x00 union {
    // 0 for terminating null import descriptor
    0x00 DWORD Characteristics;
    
    // RVA to original unbound IAT
    0x00 PIMAGE_THUNK_DATA OriginalFirstThunk;
  } u;

  // 0 if not bound,-1 if bound, and real date\time stamp
  // in IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT (new BIND) otherwise date/time stamp of DLL bound to (Old BIND)
  0x04 DWORD TimeDateStamp;

  // -1 if no forwarders
  0x08 DWORD ForwarderChain;
  0x0c DWORD Name;

  // RVA to IAT (if bound this IAT has actual addresses)
  0x10 PIMAGE_THUNK_DATA FirstThunk;
};
 * ```
 */
export class IMAGE_DIRECTORY_ENTRY_IMPORT extends PE_FILE_BASE {
  static size = 0x14; // 20

  /**
   * 导入查找表的RVA。
   *
   * 该表包含每个导入的名称或顺序。 （在Winnt.h中使用名称“ Characteristics”，但不再描述此字段。）
   */
  u: IMAGE_DIRECTORY_ENTRY_IMPORT_U;

  /**
   * 在绑定图像之前将其设置为零的标记。 绑定图像后，此字段设置为DLL的时间/数据标记。
   */
  TimeDateStamp: Buffer;

  /**
   * -1（如果没有转发器）
   *
   * 第一个转发器参考的索引。
   */
  ForwarderChain: Buffer;

  /**
   * 包含DLL名称的ASCII字符串的地址。RVA
   */
  Name: Buffer;

  /**
   * 导入地址表的RVA。 在绑定图像之前，此表的内容与导入查找表的内容相同。
   *
   * 指向IAT表 import address table
   *
   * IAT表 加载前存的函数名，加载后存的函数地址
   */
  FirstThunk: Buffer;

  constructor(data: Buffer, offset: number) {
    super(data, offset);

    this.u = new IMAGE_DIRECTORY_ENTRY_IMPORT_U(this._readByte(DWORD_t));
    this.TimeDateStamp = this._readByte(DWORD_t);
    this.ForwarderChain = this._readByte(DWORD_t);
    this.Name = this._readByte(DWORD_t);
    this.FirstThunk = this._readByte(DWORD_t);
  }
}

/**
 * ```
 0x00 union {

        // 0 for terminating null import descriptor
        0x00 DWORD Characteristics;

        // RVA to original unbound IAT
        0x00 PIMAGE_THUNK_DATA OriginalFirstThunk;
      } u;
  ```
 */
export class IMAGE_DIRECTORY_ENTRY_IMPORT_U {
  /**
   * 0表示终止空导入描述符
   */
  Characteristics: Buffer;

  /**
   * 指向IMT表 import name table
   */
  OriginalFirstThunk: Buffer;
  constructor(data: Buffer) {
    this.Characteristics = data;
    this.OriginalFirstThunk = data;
  }
}

/**
 * 
 * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#import-lookup-table
 * 
 * 
 ```
 typedef struct _IMAGE_THUNK_DATA {
  union {
    0x00 LPBYTE ForwarderString;
    0x00 PDWORD Function;
    0x00 DWORD Ordinal;
    0x00 PIMAGE_IMPORT_BY_NAME AddressOfData;
  } u1;
} IMAGE_THUNK_DATA,*PIMAGE_THUNK_DATA
 ```
 */
export class IMAGE_THUNK_DATA {
  /**
   *  Ordinal/Name Flag
   *
   * 31/63
   *
   * 如果设置了此位，则按顺序导入。 否则，请按名称导入
   */
  OrdinalOrNameFlag: number;

  /**
   * 16位序数。
   *
   * 仅当OrdinalOrNameFlag为1（按序号导入）时，才使用此字段。
   *
   * 30-15位或62-15位必须为0。
   */
  OrdinalNumber?: number;

  /**
   *
   * Hint/Name Table
   *
   * 提示/名称表条目的31位RVA。仅当OrdinalOrNameFlag为0（按名称导入）时，才使用此字段。 对于PE32+,62-31位必须为零。
   *
   */
  name?: PIMAGE_IMPORT_BY_NAME;

  constructor(pe: PE_FILE, data: Buffer, rva: number) {
    const bX64 = isX64PE(pe);
    let bit = toBit(rva, bX64);

    this.OrdinalOrNameFlag = +getBitIndex(bit, bX64 ? 63 : 31);

    // OrdinalOrNameFlag为1（按序号导入）时，才使用此字段。
    if (this.OrdinalOrNameFlag == 1) {
      this.OrdinalNumber = +getBitRange(bit, 0, 15);
    }

    // 提示/名称表条目的31位RVA。仅当OrdinalOrNameFlag为0（按名称导入）时，才使用此字段。 对于PE32+,62-31位必须为零。
    if (this.OrdinalOrNameFlag == 0) {
      const HintOrNameTableRVA = parseInt(getBitRange(bit, 0, 31), 2);
      this.name = new PIMAGE_IMPORT_BY_NAME(
        data,
        RVA2FOA(pe, HintOrNameTableRVA)
      );
    }
  }
}

/**
 ```
typedef struct _IMAGE_IMPORT_BY_NAME {
  0x00 WORD Hint;
  0x02 BYTE Name[1];
} IMAGE_IMPORT_BY_NAME,*PIMAGE_IMPORT_BY_NAME;
 ```
 */
export class PIMAGE_IMPORT_BY_NAME {
  /**
   * 导出名称指针表的索引。 首先尝试与此值匹配。 如果失败，则对DLL的导出名称指针表执行二进制搜索。
   */
  Hint: Buffer;

  /**
   * 包含要导入名称的ASCII字符串。 这是必须与DLL中的公共名称匹配的字符串。 该字符串区分大小写，并以空字节结尾。
   */
  Name: Buffer;
  constructor(data: Buffer, offset: number) {
    this.Hint = readByte(data, offset, WORD_t);
    this.Name = readASCII(data, offset + WORD_t);
  }
}

/**
 * 解析 导入表
 */
export class IMAGE_DIRECTORY_ENTRY_IMPORT_PARSE {
  /**
   * 导入查找表的RVA。 该表包含每个导入的名称或顺序。 （在Winnt.h中使用名称“ Characteristics”，但不再描述此字段。）
   */
  u: IMAGE_THUNK_DATA[] = [];

  /**
   * 在绑定图像之前将其设置为零的标记。 绑定图像后，此字段设置为DLL的时间/数据标记。
   */
  TimeDateStamp: Buffer;

  /**
   * -1（如果没有转发器）
   *
   * 第一个转发器参考的索引。
   */
  ForwarderChain: Buffer;

  /**
   * 包含DLL名称的ASCII字符串的地址。RVA
   */
  Name: Buffer;

  /**
   * 导入地址表的RVA。 在绑定图像之前，此表的内容与导入查找表的内容相同。
   */
  FirstThunk: IMAGE_THUNK_DATA[] = [];

  constructor(pe: PE_FILE, imp: IMAGE_DIRECTORY_ENTRY_IMPORT, data: Buffer) {
    const bX64 = isX64PE(pe);
    const size = bX64 ? QWORD_t : DWORD_t;

    let chunksOffsetFOA = RVA2FOA(pe, imp.u.OriginalFirstThunk);

    while (true) {
      const rva = buffer2dec(readByte(data, chunksOffsetFOA, size));
      if (rva === 0) break;
      this.u.push(new IMAGE_THUNK_DATA(pe, data, rva));
      chunksOffsetFOA += size;
    }

    this.TimeDateStamp = imp.TimeDateStamp;
    this.ForwarderChain = imp.ForwarderChain;
    this.Name = readASCII(data, RVA2FOA(pe, imp.Name));

    // 加载前,FirstThunk和导入查找表相同
    chunksOffsetFOA = RVA2FOA(pe, imp.FirstThunk);
    while (true) {
      const rva = buffer2dec(readByte(data, chunksOffsetFOA, size));
      if (rva === 0) break;
      this.FirstThunk.push(new IMAGE_THUNK_DATA(pe, data, rva));
      chunksOffsetFOA += size;
    }
  }
}
