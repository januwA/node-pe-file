import * as fs from "fs";
import { PE_FILE, align, IMAGE_DIRECTORY_ENTRY_IMPORT } from "../src";

describe("main", () => {
  it("test pe", (done) => {
    fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data) => {
      const pe = new PE_FILE(data);
      console.log(
        pe.image_nt_headers.image_optional_header.DataDirectory[
          IMAGE_DIRECTORY_ENTRY_IMPORT
        ],
      );

      done();
    });
  });

  // it("test align", () => {
  //   expect(align(0x80, 0x100)).toBe(0x100);
  //   expect(align(0x120, 0x100)).toBe(0x200);
  //   expect(align(0x4000, 0x1000)).toBe(0x4000);
  // });
});
