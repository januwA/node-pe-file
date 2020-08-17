## nodejs 解析PE文件

```
import * as fs from "fs";

import { PE_FILE } from "node-pe-file";

fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data: Buffer) => {
  const pe = new PE_FILE(data);
  console.log(pe);
});
```

## 导出表
```
fs.readFile("C:\\Windows\\System32\\opengl32.dll", (er, data) => {
  const pe = new PE_FILE(data);
  const ed = CREATE_IMAGE_EXPORT_DIRECTORY(pe, data);
  const edp =  new IMAGE_EXPORT_DIRECTORY_PARSE(pe, ed, data);
  console.log(edp.exports);
});
```

## 重定位表
```
fs.readFile("C:\\Windows\\System32\\opengl32.dll", (er, data) => {
  const pe = new PE_FILE(data);
  const deb = CREATE_IMAGE_DIRECTORY_ENTRY_BASERELOC(pe, data);
  console.log(arrayLast(deb));
  console.log(
    new IMAGE_DIRECTORY_ENTRY_BASERELOC_PARSE(pe, arrayLast(deb), data)
  );
});
```


- [高清PDF](http://www.openrce.org/reference_library/files/reference/PE%20Format.pdf)
- [microsoft 文档](https://docs.microsoft.com/en-us/windows/win32/debug/pe-format)