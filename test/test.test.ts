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
} from "../src";

const l = console.log;

describe("main", () => {
  // it("test exe", (done) => {
  //   fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data) => {
  //     const pe = new PE_FILE(data);
  //     console.log(
  //       pe.image_nt_headers.image_optional_header.DataDirectory[
  //         IMAGE_DIRECTORY_ENTRY_IMPORT
  //       ],
  //     );

  //     done();
  //   });
  // });

  it("test dll", (done) => {
    const p = "D:\\games\\csgo\\csgolauncher.exe";
    // const p = "C:\\Windows\\System32\\opengl32.dll";
    fs.readFile(p, (er, data) => {
      const pe = new PE_FILE(data);
      const ed = CREATE_IMAGE_EXPORT_DIRECTORY(pe, data);
      const edp =  new IMAGE_EXPORT_DIRECTORY_PARSE(pe, ed, data);
      console.log(edp);
      

      done();
    });
  });

  // it("test align", () => {
  //   expect(align(0x80, 0x100)).toBe(0x100);
  //   expect(align(0x120, 0x100)).toBe(0x200);
  //   expect(align(0x4000, 0x1000)).toBe(0x4000);
  // });
});
