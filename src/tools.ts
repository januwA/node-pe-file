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

/**
 * 自动补零
 *
 * 索引从0开始
 *
 * 如果传入字符串自动补零
 *
 * @param num
 */
export function toBit(num: number | string, bX64: boolean = false) {
  let bit = typeof num === "number" ? num.toString(2) : num;
  const max = bX64 ? 64 : 32;
  while (true) {
    if (bit.length >= max) break;
    bit = "0" + bit;
  }
  return bit;
}

/**
 * 索引从0开始
 */
export function getBitIndex(
  bit: string | number | Buffer,
  index: number
): string {
  if (bit instanceof Buffer) {
    bit = buffer2dec(bit);
  }
  
  if (typeof bit === "number") {
    bit = bit.toString(2);
  }

  // 溢出返回 0
  return bit[bit.length - 1 - index] || "0";
}

/**
 * 请自动补好零
 *
 * 获取0位-15位
 * ```
 * getBitRange(bit, 0, 15)
 * ```
 *
 * @param bit
 * @param start
 * @param end
 */
export function getBitRange(bit: string, start: number, end: number) {
  return bit.slice(bit.length - 1 - end, bit.length - start);
}