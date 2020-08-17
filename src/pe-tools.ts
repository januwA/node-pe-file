import { PE_FILE } from "./node-pe-file";
import { buffer2dec, memcpy, arrayLast } from "./tools";
import { Section_Flags } from "./flags";
import { IMAGE_SECTION_HEADER } from "./IMAGE_SECTION_HEADER";
import { IMAGE_SIZEOF_SHORT_NAME, DWORD, WORD } from "./types";

/**
 * 将RAM的虚拟地址转化为文件偏移地址
 * 
 * ```
  const pe_file = new PE_FILE(data);
  const foa = RVA2FOA(pe_file, 0x00466d35);
  console.log(foa.toString(16));
  
  const foa2 = RVA2FOA(pe_file, 0x00400001);
  console.log(foa2.toString(16));
 * ```
 * 
 * @param pe
 * @param rva
 */
export function RVA2FOA(pe: PE_FILE, rva: number) {
  let r = rva - buffer2dec(pe.image_nt_headers.image_optional_header.ImageBase);

  // 1. 如果在dos头，nt头，节表内
  if (r < buffer2dec(pe.image_nt_headers.image_optional_header.SizeOfHeaders)) {
    return r;
  }

  // 2. 判断在那个(内存)节内
  const section = pe.image_section_headers.find((it) => {
    return (
      r > buffer2dec(it.VirtualAddress) &&
      r < buffer2dec(it.VirtualAddress) + buffer2dec(it.SizeOfRawData)
    );
  });

  if (!section) return 0;

  // 3. 计算相对于节中的偏移量
  const sectionOffset = r - buffer2dec(section.VirtualAddress);

  // 4. 返回foa
  return buffer2dec(section.PointerToRawData) + sectionOffset;
}

/**
 * 将在虚拟内存中的文件重写入文件buffer
 * 
 * ```
  const pe_file = new PE_FILE(data);
  const newmem = runPeFile(pe_file, data);
  const buf = mem2buffer(pe_file, newmem);

  fs.writeFile("./gg.exe", buf, (er) => {
    if (er) {
      console.error(er);
    } else {
      console.log("write gg.exe ok.");
    }
  });
 * ```
 * @param pe 
 * @param newmem 
 */
export function mem2buffer(pe: PE_FILE, newmem: Buffer) {
  const lastSection = arrayLast(pe.image_section_headers);

  // 最后一个段的文件偏移 + 最后一个段对齐后的大小 = 文件在磁盘中的大小
  const filesize =
    buffer2dec(lastSection.PointerToRawData) +
    buffer2dec(lastSection.SizeOfRawData);
  const buf = Buffer.alloc(filesize, 0);

  // 1. 将dos头，nt头，节表拷贝到 buf
  let offset = buffer2dec(
    pe.image_nt_headers.image_optional_header.SizeOfHeaders
  );
  memcpy(buf, newmem, offset);

  // 2. 将所有段数据拷到 buf
  pe.image_section_headers.forEach((it) => {
    const sourceStart = buffer2dec(it.VirtualAddress);
    const sourceEnd = sourceStart + buffer2dec(it.SizeOfRawData);
    newmem.copy(buf, buffer2dec(it.PointerToRawData), sourceStart, sourceEnd);
  });

  return buf;
}

/**
 * 获取节的flag
 * 
 * ```
  console.log(
    getSectionFlags(buffer2dec( pe.image_section_headers[4].Characteristics ))
  );
 * ```
 * 
 * @param Characteristics 
 */
export function getSectionFlags(Characteristics: number) {
  return Object.keys(Section_Flags).reduce<string[]>((acc, key, i) => {
    const v: number = Characteristics & Section_Flags[key];
    if (v !== 0) acc.push(key);
    return acc;
  }, []);
}

/**
 * 模拟PE文件读取到虚拟内存中时的操作
 * 
 * ```
  const pe_file = new PE_FILE(data);
  const newmem = runPeFile(pe_file, data);

  const SizeOfHeaders = buffer2dec(
    pe_file.image_nt_headers.image_optional_header.SizeOfHeaders
  );
  for (let i = 0; i < SizeOfHeaders; i++) {
    if (data[i] !== newmem[i]) {
      console.error("header copy error index: ", i);
    }
  }

  const firstSection = pe_file.image_section_headers[0];
  const fileAddr = buffer2dec(firstSection.PointerToRawData);
  const memAddr = buffer2dec(firstSection.VirtualAddress);

  for (let i = 0; i < buffer2dec(firstSection.Misc.VirtualSize); i++) {
    if (data[fileAddr + i] !== newmem[memAddr + i]) {
      console.error("section copy eccor index: ", i);
    }
  }
 * ```
 * @param pe 
 * @param data 
 */
export function runPeFile(pe: PE_FILE, data: Buffer) {
  const newmem = Buffer.alloc(
    buffer2dec(pe.image_nt_headers.image_optional_header.SizeOfImage),
    0
  );

  // 1. 将dos头，nt头，节表拷贝到mem
  let offset = buffer2dec(
    pe.image_nt_headers.image_optional_header.SizeOfHeaders
  );
  memcpy(newmem, data, offset);

  // 2. 将所有段数据拷到 newmem
  pe.image_section_headers.forEach((it) => {
    const sourceStart = buffer2dec(it.PointerToRawData);
    const sourceEnd = sourceStart + buffer2dec(it.SizeOfRawData);
    data.copy(newmem, buffer2dec(it.VirtualAddress), sourceStart, sourceEnd);
  });

  return newmem;
}

export function getPeFilesize(pe: PE_FILE) {
  const lastSection = arrayLast(pe.image_section_headers);

  // 最后一个段的文件偏移 + 最后一个段对齐后的大小 = 文件在磁盘中的大小
  return (
    buffer2dec(lastSection.PointerToRawData) +
    buffer2dec(lastSection.SizeOfRawData)
  );
}

/**
   * 增加一个节
   ```
    const pe = new PE_FILE(data);
    pushSection(pe, data, {
      Name: ".ajanuw",
      Characteristics: Section_Flags.IMAGE_SCN_MEM_WRITE,
    });


    // PRINT_SECTION(pe);
    
    const newmem = RUN_PE_FILE(pe, data);

    const buf = mem2buffer(pe, newmem);

    fs.writeFile("./gg.exe", buf, (er) => {
      if (er) {
        console.error(er);
      } else {
        console.log("write gg.exe ok.");
      }
    });
    ```
   */
export function pushSection(
  pe: PE_FILE,
  data: Buffer,
  sectionOpt: {
    Name: string;

    /**
     * https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#section-flags
     */
    Characteristics: number;
  }
) {
  // 1. 判断节表大小，还能否写入一个新的节表信息
  const SizeOfHeaders = buffer2dec(
    pe.image_nt_headers.image_optional_header.SizeOfHeaders
  );
  const lastSection = arrayLast(pe.image_section_headers);

  // SizeOfHeaders - (lastSection addr + lastSection size) == 剩下的大小
  // 也可以用第一个节的起始地址代替SizeOfHeaders
  const size = SizeOfHeaders - lastSection.offset;

  if (size < IMAGE_SECTION_HEADER.size * 2) {
    // 如果小于80字节，就不能加
    return 0;
  }

  // 2. 修改PE文件中节的数量
  pe.image_nt_headers.image_file_header.NumberOfSections.writeUInt16LE(
    buffer2dec(pe.image_nt_headers.image_file_header.NumberOfSections) + 1,
    0
  );

  // 3. 修改SizeOfImage大小
  const oldSizeOfImage = buffer2dec(
    pe.image_nt_headers.image_optional_header.SizeOfImage
  );

  pe.image_nt_headers.image_optional_header.SizeOfImage.writeUInt32LE(
    oldSizeOfImage + SizeOfHeaders,
    0
  );

  // 使用固定长度存name，避免溢出
  const namebuf = Buffer.alloc(IMAGE_SIZEOF_SHORT_NAME);
  namebuf.write(sectionOpt.Name, "ascii");

  let offset = 0;

  // IMAGE_SECTION_HEADER Name
  const newSectionBuffer = Buffer.alloc(IMAGE_SECTION_HEADER.size);
  namebuf.copy(newSectionBuffer, 0, 0, IMAGE_SIZEOF_SHORT_NAME);
  offset += IMAGE_SIZEOF_SHORT_NAME;

  // DWORD Misc
  newSectionBuffer.writeInt32LE(SizeOfHeaders, offset);
  offset += DWORD;

  // DWORD VirtualAddress
  const VirtualAddress =
    buffer2dec(lastSection.VirtualAddress) +
    buffer2dec(lastSection.SizeOfRawData);
  newSectionBuffer.writeUInt32LE(VirtualAddress, offset);
  offset += DWORD;

  // DWORD SizeOfRawData;
  newSectionBuffer.writeInt32LE(SizeOfHeaders, offset);
  offset += DWORD;

  // DWORD PointerToRawData
  const PointerToRawData =
    buffer2dec(lastSection.PointerToRawData) +
    buffer2dec(lastSection.SizeOfRawData);
  newSectionBuffer.writeUInt32LE(PointerToRawData, offset);
  offset += DWORD;

  // DWORD PointerToRelocations;
  newSectionBuffer.writeUInt32LE(0, offset);
  offset += DWORD;

  // DWORD PointerToLinenumbers;
  newSectionBuffer.writeUInt32LE(0, offset);
  offset += DWORD;

  // WORD NumberOfRelocations;
  newSectionBuffer.writeUInt16LE(0, offset);
  offset += WORD;

  // WORD NumberOfLinenumbers;
  newSectionBuffer.writeUInt16LE(0, offset);
  offset += WORD;

  // DWORD Characteristics;
  newSectionBuffer.writeUInt32LE(sectionOpt.Characteristics, offset);
  offset += WORD;

  // 将新的节考到data中去
  newSectionBuffer.copy(
    data,
    lastSection.offset,
    0,
    newSectionBuffer.byteLength
  );

  const newSection = new IMAGE_SECTION_HEADER(newSectionBuffer, 0);
  newSection.offset = lastSection.offset + IMAGE_SECTION_HEADER.size;

  pe.image_section_headers.push(newSection);
}

/**
 * 对齐
 * @param size
 * @param alignSize
 */
export function align(size: number, alignSize: number): number {
  if (size < alignSize) return alignSize;
  return Math.ceil(size / alignSize) * alignSize;
}

/**
 * 通过SizeOfOptionalHeader检查PE文件是否为 x64
 * @param pe
 */
export function isX64PE(SizeOfOptionalHeader: number) {
  return SizeOfOptionalHeader === 0xf0;
}
