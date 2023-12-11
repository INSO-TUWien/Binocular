import { join } from "path";
export const alias = [
  {
    // source: https://github.com/vitejs/vite/issues/382#issuecomment-826318764
    find: /~(.+)/,
    replacement: join(process.cwd(), "node_modules/$1"),
  },
  // alias webpack.common.js
  {
    find: "http",
    // replacement: "stream-http",
    replacement: "rollup-plugin-node-polyfills/polyfills/http",
  },
  {
    find: "https",
    // replacement: "https-browserify",
    replacement: "rollup-plugin-node-polyfills/polyfills/http",
  },
  {
    find: "stream",
    // replacement: "stream-browserify",
    replacement: "rollup-plugin-node-polyfills/polyfills/stream",
  },
  {
    find: "readable-stream",
    // replacement: "stream-browserify",
    replacement: "rollup-plugin-node-polyfills/polyfills/stream",
  },
  {
    find: "zlib",
    // replacement: "browserify-zlib",
    replacement: "rollup-plugin-node-polyfills/polyfills/zlib",
  },
  // fallback webpack.common.js
  
  {
    find: "url",
    // replacement: "url",
    replacement: "rollup-plugin-node-polyfills/polyfills/url",
  },
  {
    find: "util",
    // replacement: "util",
    replacement: "rollup-plugin-node-polyfills/polyfills/util",
  },
  {
    find: "assert",
    // replacement: "assert",
    replacement: "rollup-plugin-node-polyfills/polyfills/assert",
  },
  // plugins webpack.common.js
  // {
  //   find: "process",
  //   replacement: "process/browser"
  //   // replacement: "rollup-plugin-node-polyfills/polyfills/process-es6"
  // },
  {
    find: "socket.io-client",
    replacement: "socket.io-client/dist/socket.io.js"
  },
  {
    find: "events",
    replacement: "rollup-plugin-node-polyfills/polyfills/events"
  },
  // {
  //   find: "string_decoder",
  //   replacement: "rollup-plugin-node-polyfills/polyfills/string-decoder"
  // },
  {
    find: "_stream_duplex",
    replacement: "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex"
  },
  {
    find: "_stream_passthrough",
    replacement: "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough"
  },
  {
    find: "_stream_readable",
    replacement: "rollup-plugin-node-polyfills/polyfills/readable-stream/readable"
  },
  {
    find: "_stream_writable",
    replacement: "rollup-plugin-node-polyfills/polyfills/readable-stream/writable"
  },
  {
    find: "_stream_transform",
    replacement: "rollup-plugin-node-polyfills/polyfills/readable-stream/transform"
  },
  {
    find: "buffer",
    replacement: "rollup-plugin-node-polyfills/polyfills/buffer-es6"
  },
  {
    find: "safer-buffer",
    replacement: "rollup-plugin-node-polyfills/polyfills/buffer-es6"
  },
  {
    find: "querystring",
    replacement: "rollup-plugin-node-polyfills/polyfills/qs"
  },
  {
    find: "sys",
    replacement: "util"
  },
  {
    find: "vm",
    replacement: "rollup-plugin-node-polyfills/polyfills/vm"
  },
  {
    find: "console",
    replacement: "rollup-plugin-node-polyfills/polyfills/console"
  },
  {
    find: "tty",
    replacement: "rollup-plugin-node-polyfills/polyfills/tty"
  },
  {
    find: "domain",
    replacement: "rollup-plugin-node-polyfills/polyfills/domain"
  },
  {
    find: "timers",
    replacement: "rollup-plugin-node-polyfills/polyfills/timers"
  },
  {
    find: "constants",
    replacement: "rollup-plugin-node-polyfills/polyfills/constants"
  },
  {
    find: "os",
    replacement: "rollup-plugin-node-polyfills/polyfills/os"
  },
  {
    find: "punycode",
    replacement: "rollup-plugin-node-polyfills/polyfills/punycode"
  },
  {
    find: "path",
    replacement: "rollup-plugin-node-polyfills/polyfills/path"
  },
  {
    find: "crypto",
    replacement: "crypto-browserify",
    // replacement: "rollup-plugin-node-polyfills/polyfills/crypto-browserify",
  },
]
