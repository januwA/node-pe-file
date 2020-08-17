export function readByte(data: Buffer, offset: number, size: number) {
  return data.slice(offset, offset + size);
}

export function memcpy(dest: Buffer, src: Buffer, count: number) {
  src.copy(dest, 0, 0, count);
}

export function copyBuffer(dest: Buffer) {
  let newBuf = Buffer.alloc(dest.length, 0);
  memcpy(newBuf, dest, dest.length);
  return newBuf;
}
export function buffer2dec(data: Buffer) {
  return parseInt(copyBuffer(data).reverse().toString("hex"), 16);
}

export function buffer2hex(data: Buffer) {
  return copyBuffer(data).reverse().toString("hex").toUpperCase();
}

export function arrayLast(arr: any[], lastOffset = 1) {
  return arr[arr.length - lastOffset];
}
