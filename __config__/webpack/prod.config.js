process.env.NODE_ENV = "production";

// 最小化生产
const TerserJSPlugin = require("terser-webpack-plugin");

const CopyFilePlugin = require("webpack-copy-file-plugin");

const shared = require("./shared");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: shared.entry,
  externals: shared.externals,
  module: {
    rules: shared.rules,
  },
  resolve: shared.resolve,
  optimization: {
    // 压缩js,css文件
    minimizer: [new TerserJSPlugin({})],
  },
  plugins: [
    ...shared.plugins,
    // new CopyFilePlugin(["./README.md"].map(f => path.resolve(__dirname, f)))
  ],
  output: shared.output,
};
