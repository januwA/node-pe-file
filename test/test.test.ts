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
} from "../src";
import { arrayLast } from "../src/tools";

const l = console.log;

describe("main", () => {
  // it("test exe", (done) => {
  //   fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data) => {
  //     const pe = new PE_FILE(data);
  //     const deb = CREATE_IMAGE_DIRECTORY_ENTRY_BASERELOC(pe, data);
  //     done();
  //   });
  // });

  it("test dll", (done) => {
    fs.readFile("C:\\Windows\\System32\\opengl32.dll", (er, data) => {
      const pe = new PE_FILE(data);
      //const ed = CREATE_IMAGE_EXPORT_DIRECTORY(pe, data);
      //const edp =  new IMAGE_EXPORT_DIRECTORY_PARSE(pe, ed, data);
      //console.log(edp);

      const deb = CREATE_IMAGE_DIRECTORY_ENTRY_BASERELOC(pe, data);
      console.log(arrayLast(deb));

      console.log(
        new IMAGE_DIRECTORY_ENTRY_BASERELOC_PARSE(pe, arrayLast(deb), data)
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
