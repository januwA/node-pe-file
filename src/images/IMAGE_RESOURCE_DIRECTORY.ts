import { PE_FILE_BASE } from "../PE_FILE_BASE";
import { WORD_t, DWORD_t, BYTE_t, QWORD_t } from "../types";
import { buffer2dec, toBit, getBitIndex } from "../tools";

/**
 * 
 * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#resource-directory-table
 * 
 * https://www.cnblogs.com/iBinary/p/7712932.html
 * 
 * ```
    struct _IMAGE_RESOURCE_DIRECTORY {
      0x00 DWORD Characteristics;
      0x04 DWORD TimeDateStamp;
      0x08 WORD MajorVersion;
      0x0a WORD MinorVersion;
      0x0c WORD NumberOfNamedEntries;
      0x0e WORD NumberOfIdEntries;
    };
    ```
   */
export class IMAGE_RESOURCE_DIRECTORY extends PE_FILE_BASE {
  static size = 16;

  /**
   * 资源标志。该字段保留供将来使用。当前设置为零。
   */
  Characteristics: Buffer;

  /**
   * 资源数据由资源编译器创建的时间。
   */
  TimeDateStamp: Buffer;

  /**
   * 主版本号，由用户设置。
   */
  MajorVersion: Buffer;

  /**
   * 次要版本号，由用户设置。
   */
  MinorVersion: Buffer;

  /**
   * 表后面紧跟的目录条目的数量，这些目录条目使用字符串标识“类型”，“名称”或“语言”条目（取决于表的级别）。
   */
  NumberOfNamedEntries: number;

  /**
   * 在名称条目之后紧跟的目录条目的数量，这些名称使用数字ID表示类型，名称或语言条目。
   */
  NumberOfIdEntries: number;
  constructor(data: Buffer, offset: number) {
    super(data, offset);
    this.Characteristics = this._readByte(DWORD_t);
    this.TimeDateStamp = this._readByte(DWORD_t);
    this.MajorVersion = this._readByte(WORD_t);
    this.MinorVersion = this._readByte(WORD_t);
    this.NumberOfNamedEntries = buffer2dec(this._readByte(WORD_t));
    this.NumberOfIdEntries = buffer2dec(this._readByte(WORD_t));
  }
}

/**
 * 
 * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#resource-directory-entries
 * 
 * ```
typedef struct _IMAGE_RESOURCE_DIRECTORY_ENTRY {
    union {
        struct {
            DWORD NameOffset:31;　　　　　　　　　　位段: 低31位飘逝偏移 定义了目录项的名称或者ID
            DWORD NameIsString:1;　　　　　　　　　 位段: 高位, 如果这位为1,则表示31位的偏移指向的是一个Unicode字符串的指针偏移
        };　　　　　　　　　　　　　　　　　　　　　　　这里列出结构体,自己去看,IMAGE_RESOURCE_DIR_STRING_U 里面是字符串长度还有字符串,不是\0结尾　　　　　　　　　
        DWORD   Name;　　　　　　　　　　　　　　　　　
        WORD    Id;
    };
    union {
        DWORD   OffsetToData;　　　　　　　　　　　　偏移RVA因为是联合体,所以有不同的解释
        struct {
            DWORD   OffsetToDirectory:31;　　　　看高位,如果高位是1,那么RVA偏移指向的是新的(根目录)
            DWORD   DataIsDirectory:1;　　　　　　
        };
    };
} IMAGE_RESOURCE_DIRECTORY_ENTRY, *PIMAGE_RESOURCE_DIRECTORY_ENTRY;
```

```
struct IMAGE_RESOURCE_DIRECTORY_ENTRY
{
    public uint Name;
    public uint OffsetToData;
}
```
 */
export class IMAGE_RESOURCE_DIRECTORY_ENTRY extends PE_FILE_BASE {
  static size = 8;

  /**
   * 字符串的偏移量，根据表级别提供类型，名称或语言ID条目。
   */
  Name: number;

  /**
   * 一个32位整数，标识“类型”，“名称”或“语言ID”条目。
   *
   * * 3 icon资源
   */
  Id: number;
  isID: boolean;

  /**
   * 高位0。低31位指向文件结构体 IMAGE_RESOURCE_DATA_ENTRY
   * 
   * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#resource-data-entry
   *
   * !RVA
   */
  OffsetToData: number;

  /**
   * 高位1。低31位指向子文件夹 IMAGE_RESOURCE_DIRECTORY_ENTRY。
   *
   * ! RVA
   */
  SubdirectoryOffset: number;
  isSubdirectoryOffset: boolean;

  /**
   * 子目录的 FOA
   */
  SubdirectoryOffsetFOA: number = 0;

  constructor(data: Buffer, offset: number) {
    super(data, offset);
    const pldOffset = offset;

    const _name = this._readByte(DWORD_t);
    this.Id = buffer2dec(_name);
    this.Name = this.Id;

    const mask31 = 1 << 31;

    if (this.Id & mask31) {
      // 指向新的目录项名称的结构体
      this.Name &= ~mask31; // 去掩码
      this.isID = false;
    } else {
      // 资源ID类型
      this.isID = true;
    }

    this.OffsetToData = buffer2dec(this._readByte(DWORD_t));
    this.SubdirectoryOffset = this.OffsetToData;

    // 高位1，指向子目录
    if (this.OffsetToData & mask31) {
      this.SubdirectoryOffset &= ~mask31; // 去掩码
      this.isSubdirectoryOffset = true;
      this.SubdirectoryOffsetFOA = pldOffset + this.SubdirectoryOffset;
    } else {
      this.isSubdirectoryOffset = false;
    }
  }
}
