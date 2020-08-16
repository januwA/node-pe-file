import { PE_FILE_BASE } from "./PE_FILE_BASE";
import { WORD, DWORD } from "./types";

/**
struct _IMAGE_DOS_HEADER {
  0x00 WORD e_magic;
  0x02 WORD e_cblp;
  0x04 WORD e_cp;
  0x06 WORD e_crlc;
  0x08 WORD e_cparhdr;
  0x0a WORD e_minalloc;
  0x0c WORD e_maxalloc;
  0x0e WORD e_ss;
  0x10 WORD e_sp;
  0x12 WORD e_csum;
  0x14 WORD e_ip;
  0x16 WORD e_cs;
  0x18 WORD e_lfarlc;
  0x1a WORD e_ovno;
  0x1c WORD e_res[4];
  0x24 WORD e_oemid;
  0x26 WORD e_oeminfo;
  0x28 WORD e_res2[10];
  0x3c DWORD e_lfanew;
};
 */
export class IMAGE_DOS_HEADER extends PE_FILE_BASE {
  static size = 0x40; // 64

  /**
   * MZ 标记，二进制可执行文件，PE文件
   */
  e_magic: Buffer;
  e_cblp: Buffer;
  e_cp: Buffer;
  e_crlc: Buffer;
  e_cparhdr: Buffer;
  e_minalloc: Buffer;
  e_maxalloc: Buffer;
  e_ss: Buffer;
  e_sp: Buffer;
  e_csum: Buffer;
  e_ip: Buffer;
  e_cs: Buffer;
  e_lfarlc: Buffer;
  e_ovno: Buffer;
  e_res: Buffer[] = [];
  e_oemid: Buffer;
  e_oeminfo: Buffer;
  e_res2: Buffer[] = [];

  /**
   * NT_HEADERS 地址
   */
  e_lfanew: Buffer;

  constructor(data: Buffer, offset: number) {
    super(data, offset);
    this.e_magic = this._readByte(WORD);
    this.e_cblp = this._readByte(WORD);
    this.e_cp = this._readByte(WORD);
    this.e_crlc = this._readByte(WORD);
    this.e_cparhdr = this._readByte(WORD);
    this.e_minalloc = this._readByte(WORD);
    this.e_maxalloc = this._readByte(WORD);
    this.e_ss = this._readByte(WORD);
    this.e_sp = this._readByte(WORD);
    this.e_csum = this._readByte(WORD);
    this.e_ip = this._readByte(WORD);
    this.e_cs = this._readByte(WORD);
    this.e_lfarlc = this._readByte(WORD);
    this.e_ovno = this._readByte(WORD);
    this.e_res = [
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
    ];
    this.e_oemid = this._readByte(WORD);
    this.e_oeminfo = this._readByte(WORD);
    this.e_res2 = [
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
      this._readByte(WORD),
    ];
    this.e_lfanew = this._readByte(DWORD);
  }
}
