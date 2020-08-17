import * as fs from "fs";
import {
  PE_FILE,
  align,
  IMAGE_DIRECTORY_ENTRY_IMPORT,
  IMAGE_DIRECTORY_ENTRY_EXPORT,
  buffer2hex,
  RVA2FOA,
  buffer2dec
} from "../src";

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
    fs.readFile("C:\\Windows\\System32\\opengl32.dll", (er, data) => {
      const pe = new PE_FILE(data);

      console.log(pe.image_nt_headers.image_optional_header);
      
      done();
    });
  });

  // it("test align", () => {
  //   expect(align(0x80, 0x100)).toBe(0x100);
  //   expect(align(0x120, 0x100)).toBe(0x200);
  //   expect(align(0x4000, 0x1000)).toBe(0x4000);
  // });
});
