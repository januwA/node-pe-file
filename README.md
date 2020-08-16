## nodejs 解析PE文件

```
import * as fs from "fs";

import { PE_FILE } from "node-pe-file";

fs.readFile("C:\\Users\\ajanuw\\Desktop\\game2.exe", (er, data: Buffer) => {
  const pe = new PE_FILE(data);
  console.log(pe);
});
```


- [高清PDF](http://www.openrce.org/reference_library/files/reference/PE%20Format.pdf)
- [microsoft 文档](https://docs.microsoft.com/en-us/windows/win32/debug/pe-format)