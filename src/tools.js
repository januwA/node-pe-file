"use strict";
exports.__esModule = true;
exports.arrayLast = exports.buffer2dec = exports.copyBuffer = exports.memcpy = exports.readByte = void 0;
function readByte(data, offset, size) {
    return data.slice(offset, offset + size);
}
exports.readByte = readByte;
function memcpy(dest, src, count) {
    src.copy(dest, 0, 0, count);
}
exports.memcpy = memcpy;
function copyBuffer(dest) {
    var newBuf = Buffer.alloc(dest.length, 0);
    memcpy(newBuf, dest, dest.length);
    return newBuf;
}
exports.copyBuffer = copyBuffer;
function buffer2dec(data) {
    return parseInt(copyBuffer(data).reverse().toString("hex"), 16);
}
exports.buffer2dec = buffer2dec;
function arrayLast(arr, lastOffset) {
    if (lastOffset === void 0) { lastOffset = 1; }
    return arr[arr.length - lastOffset];
}
exports.arrayLast = arrayLast;
