const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const util = require("./util");
const tsConfig = require("../../tsconfig.json");

/**
 * 在[dev/prod.config.js]中公用的配置
 */
module.exports = {
  entry: {
    main: util.getEntryMain(),
  },
  output: {
    filename: "node-pe-file.js",
    path: util.getOutputPath(tsConfig),

    // 如果发布第三方包，可以启动下面这三个配置
    // library: "packageName",
    libraryTarget: "umd",
    globalObject: "this",
  },

  rules: [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "ts-loader",
          options: {},
        },
      ],
    },
  ],

  resolve: {
    // 导入此类文件时，不用添加后缀
    extensions: [".tsx", ".ts", ".js"],

    // 如果要配置路径别名，就在/tsconfig.json里面配置
    alias: {
      ...util.parseTsConfigPaths(tsConfig),
    },
  },
  optimization: {},
  plugins: [new CleanWebpackPlugin()],
};
