// Builds a single self-loading widget bundle (dist/widget.js). Babel handles
// TS/Preact, CSS is injected at runtime via style-loader, gzip in prod. Dev
// serves a demo page that embeds the widget.
const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env) => {
  const isProd = !!(env && env.prod);

  return {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "eval-cheap-module-source-map",
    entry: "./src/index.tsx",
    output: {
      // This is the file you deploy. The embed snippet points a <script> at it.
      filename: "widget.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        react: "@preact/compat",
        "react-dom": "@preact/compat",
      },
      // Node core modules referenced by the SDK's deploy() — not used in the
      // browser; resolve them to nothing so the build succeeds.
      fallback: {
        fs: false,
        "fs/promises": false,
        path: false,
        os: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      // The SDK's Node-only deploy() imports esbuild; the widget never calls it.
      // Replace esbuild with an empty module so the browser build never follows
      // into esbuild's Node internals (works in dev too, where dead code isn't
      // tree-shaken away).
      new webpack.NormalModuleReplacementPlugin(
        /^esbuild$/,
        path.resolve(__dirname, "src/empty.js"),
      ),
      ...(isProd
        ? [new CompressionPlugin({ algorithm: "gzip", test: /\.js$/, minRatio: 0.8 })]
        : [new HtmlWebpackPlugin({ template: "public/index.html", inject: false })]),
    ],
    optimization: {
      minimize: isProd,
      minimizer: [new TerserPlugin({ terserOptions: { format: { comments: false } } })],
    },
    devServer: {
      static: path.join(__dirname, "public"),
      port: 9101,
      hot: false,
      open: false,
    },
  };
};
