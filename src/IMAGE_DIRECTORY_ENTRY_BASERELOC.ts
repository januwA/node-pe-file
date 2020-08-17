import { PE_FILE } from "./node-pe-file";
import {
  IMAGE_DIRECTORY_ENTRY_BASERELOC_INDEX,
  DWORD_t,
  WORD_t,
} from "./types";
import { RVA2FOA } from "./pe-tools";
import { buffer2dec, buffer2hex } from "./tools";
import { PE_FILE_BASE } from "./PE_FILE_BASE";

export function CREATE_IMAGE_DIRECTORY_ENTRY_BASERELOC(
  pe: PE_FILE,
  data: Buffer
) {
  const directData =
    pe.image_nt_headers.image_optional_header.DataDirectory[
      IMAGE_DIRECTORY_ENTRY_BASERELOC_INDEX
    ];

  let offset = RVA2FOA(pe, buffer2dec(directData.VirtualAddress), true);
  if (offset === 0) return [];

  const r: IMAGE_DIRECTORY_ENTRY_BASERELOC[] = [];

  let it;
  while (true) {
    if (data.readUInt32LE(offset) === 0) break;
    it = new IMAGE_DIRECTORY_ENTRY_BASERELOC(data, offset);
    r.push(it);
    offset = it.offset;
  }

  return r;
}

/**
 * 重定位表
 * 
 * 每个基本重定位块均以以下结构开头
 * 
 * ```
struct _IMAGE_DATA_DIRECTORY {
  0x00 DWORD VirtualAddress;
  0x04 DWORD Size;
}
 * ```
 *
 * 然后，“块大小”字段后跟任意数量的“类型”或“偏移”字段条目。每个条目都是一个WORD（2个字节），并具有以下结构：
 * 
 * 
 * 4  bit 存储在WORD的高4位中的一个值，该值指示要应用的基本重定位的类型, https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#base-relocation-types
 * 
 * 12 bit 存储在WORD的其余12位中，与该块的Page RVA字段中指定的起始地址的偏移量。此偏移量指定将在何处应用基本重定位。
 * 
 */
export class IMAGE_DIRECTORY_ENTRY_BASERELOC extends PE_FILE_BASE {
  /**
   * 页基地址
   */
  VirtualAddress: Buffer;

  /**
   * 块总大小
   */
  Size: Buffer;

  tables: Buffer[] = [];

  constructor(data: Buffer, offset: number) {
    super(data, offset);
    this.VirtualAddress = this._readByte(DWORD_t);
    this.Size = this._readByte(DWORD_t);

    // 剩下的数据，每个是2字节大小
    const len = (buffer2dec(this.Size) - DWORD_t * 2) / WORD_t;

    for (let i = 0; i < len; i++) {
      this.tables.push(this._readByte(WORD_t));
    }
  }
}

/**
 * 解析 IMAGE_DIRECTORY_ENTRY_BASERELOC 的类
 */
export class IMAGE_DIRECTORY_ENTRY_BASERELOC_PARSE {
  /**
   * 页基地址
   */
  VirtualAddress: Buffer;

  /**
   * 块总大小
   */
  Size: Buffer;

  tables: {
    type: number;

    /**
     * 偏移地址
     */
    offset: number;

    offset_hex: string;

    /**
     * VirtualAddress+offset
     */
    addr: number;

    addr_hex: string;
  }[] = [];

  constructor(pe: PE_FILE, deb: IMAGE_DIRECTORY_ENTRY_BASERELOC, data: Buffer) {
    this.VirtualAddress = deb.VirtualAddress;
    this.Size = deb.Size;

    deb.tables.map((it: Buffer) => {
      const bin = buffer2dec(it).toString(2);

      const type = parseInt(bin.substr(0, 4), 2);
      const offset = parseInt(bin.substr(4), 2);
      const addr = buffer2dec(this.VirtualAddress) + offset;

      this.tables.push({
        type,
        offset,
        offset_hex: "0x" + offset.toString(16),
        addr,
        addr_hex: "0x" + addr.toString(16),
      });
    });
  }
}
