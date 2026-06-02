module.exports = {
  presets: [
    ["@babel/preset-env", { targets: "> 0.5%, last 2 versions, not dead" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    // Preact's automatic JSX runtime — no need to import `h` in every file.
    ["@babel/plugin-transform-react-jsx", { runtime: "automatic", importSource: "preact" }],
  ],
};
