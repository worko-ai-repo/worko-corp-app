/**
 * @see https://webpack.js.org/guides/typescript/
 * @see https://programoholic.medium.com/build-and-deploy-serverless-application-with-webpack-584163367390
 * @description
 *  1. Reduce the build size of the application from more than `250MB` to 2–3 MB per lambda using webpack
 */

const path = require("path");
const slsw = require("serverless-webpack");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  entry: slsw.lib.entries,

  /**
   * @description  tells webpack you're building for Node.js environment
   */
  target: "node",
  mode: slsw.lib.webpack.isLocal ? "development" : "production", // Use "production" for deployment

  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },

  /**
   * @description ForkTsCheckerWebpackPlugin is used for Typescript’s type-checking and linting.
   */
  plugins: [new ForkTsCheckerWebpackPlugin()],

  /**
   * Optimization for Lambda deployment
   */
  optimization: {
    minimize: true,

    /**
     * @description
     * TerserPlugin is one of the most popular code minification library.
     * We are using this to minify the code.
     */
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },

  /**
   * Reduce build output to prevent memory issues
   */
  stats: "errors-only",

  module: {
    rules: [
      {
        // Process all .ts files
        test: /\.ts$/,

        // Use typescript loader to covert TypeScript to JavaScript
        loader: "ts-loader",

        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        },
        
        // Only process files within `src` directory
        include: [path.resolve(__dirname, "src")],

        // Skip typescript files in dependencies
        exclude: /node_modules/,
      },
    ],
  },

  /**
   * @description  says "don't add polyfills, the runtime already has Node.js APIs"
   */
  node: false,

  /**
   * @description
   * node-externals library enables the third party dependencies to be installed separately and not included in the build file.
   * You can avoid it if you want the the third party libraries to be included in the build file.
   */
  externals: [nodeExternals()],
};
