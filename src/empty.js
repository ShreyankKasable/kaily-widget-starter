// Empty stub. The SDK's deploy() (Node-only) imports esbuild; the widget never
// calls deploy(), so we replace esbuild with this empty module so the browser
// build never pulls in esbuild's Node internals. See webpack.config.js.
module.exports = {};
