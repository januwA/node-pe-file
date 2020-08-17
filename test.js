// const fs = require("fs");
// const { PE_FILE } = require("./dist/node-pe-file");

// fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data) => {
//   const pe = new PE_FILE(data);
//   console.log(pe);
// });

let b = Buffer.alloc(4);

b.writeUInt32LE(0xFFFFFFFF, 0);

console.log(b.buffer);
