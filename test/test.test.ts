import * as fs from "fs";
import {
  PE_FILE,
  align,
  buffer2hex,
  RVA2FOA,
  buffer2dec,
  CREATE_IMAGE_EXPORT_DIRECTORY,
  getFileHeaderCharacteristicsFlags,
  IMAGE_EXPORT_DIRECTORY,
  IMAGE_EXPORT_DIRECTORY_PARSE,
  IMAGE_DIRECTORY_ENTRY_BASERELOC_PARSE,
  CREATE_IMAGE_DIRECTORY_ENTRY_BASERELOC,
  CREATE_IMAGE_DIRECTORY_ENTRY_IMPORT,
  IMAGE_DIRECTORY_ENTRY_IMPORT,
  IMAGE_DIRECTORY_ENTRY_IMPORT_PARSE,
  CREATE_IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT,
  IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT,
} from "../src";
import { arrayLast } from "../src/tools";

const l = console.log;

const gamePath = "C:\\Users\\ajanuw\\Desktop\\game2.exe";
const opengl32_dllPath = "C:\\Windows\\System32\\opengl32.dll";
const notepadPath = "C:\\Windows\\System32\\notepad.exe";

describe("main", () => {
  // it("test exe", (done) => {
  //   fs.readFile(gamePath, (er, data) => {
  //     const pe = new PE_FILE(data);
  //     const deb = CREATE_IMAGE_DIRECTORY_ENTRY_BASERELOC(pe, data);
  //     done();
  //   });
  // });

  // it("test dll", (done) => {
  //   fs.readFile(notepadPath, (er, data) => {
  //     const pe = new PE_FILE(data);
  //     console.log( pe.image_nt_headers.image_optional_header.FileAlignment );
  //     console.log( pe.image_nt_headers.image_optional_header.SectionAlignment );
  //     console.log( pe.image_nt_headers.image_optional_header.SizeOfHeaders );

  //     done();
  //   });

  it("test notepad", (done) => {
    fs.readFile(notepadPath, (er, data) => {
      const pe = new PE_FILE(data);

      console.log(
        buffer2hex(pe.image_nt_headers.image_optional_header.ImageBase)
      );

      console.log(
        buffer2hex(pe.image_nt_headers.image_optional_header.FileAlignment)
      );
      console.log(
        buffer2hex(pe.image_nt_headers.image_optional_header.SectionAlignment)
      );
      console.log(
        buffer2hex(pe.image_nt_headers.image_optional_header.SizeOfHeaders)
      );

      console.log(
        buffer2hex(pe.image_nt_headers.image_optional_header.SizeOfImage)
      );
      

      done();
    });

    // fs.readFile(gamePath, (er, data) => {
    //   const pe = new PE_FILE(data);
    //   const imp = CREATE_IMAGE_DIRECTORY_ENTRY_IMPORT(pe, data);
    //   imp.forEach((it) => {
    //     const p = new IMAGE_DIRECTORY_ENTRY_IMPORT_PARSE(pe, it, data);
    //     console.log(p.Name.toString());
    //     p.FirstThunk.forEach((name) => {
    //       console.log("  " + name?.name?.Name.toString());
    //     });
    //   });
    // });
  });

  // it("test align", () => {
  //   expect(align(0x80, 0x100)).toBe(0x100);
  //   expect(align(0x120, 0x100)).toBe(0x200);
  //   expect(align(0x4000, 0x1000)).toBe(0x4000);
  // });
});
