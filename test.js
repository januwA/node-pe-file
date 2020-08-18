const fs = require("fs");
const {
  PE_FILE,
  IMAGE_DIRECTORY_ENTRY_IMPORT_PARSE,
  CREATE_IMAGE_DIRECTORY_ENTRY_IMPORT,
} = require("./dist/node-pe-file");

const gamePath = "C:\\Users\\ajanuw\\Desktop\\game2.exe";
const opengl32_dllPath = "C:\\Windows\\System32\\opengl32.dll";

fs.readFile(gamePath, (er, data) => {
  const pe = new PE_FILE(data);

  const imp = CREATE_IMAGE_DIRECTORY_ENTRY_IMPORT(pe, data);
  imp.forEach((it) => {
    const p = new IMAGE_DIRECTORY_ENTRY_IMPORT_PARSE(pe, it, data);
    console.log(p.Name.toString());
    p.FirstThunk.forEach((it) => {
      console.log("  " + it.name?.Name?.toString());
    });
  });
});
