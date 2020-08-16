const fs = require("fs");
const { PE_FILE } = require("./dist/node-pe-file");

fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data) => {
  const pe = new PE_FILE(data);
  console.log(pe);
});
