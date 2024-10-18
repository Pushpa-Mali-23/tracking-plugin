
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'tracking-plugin.min.js',
    path: path.resolve(__dirname, ''),
    // library: 'TrackingPlugin',
    // libraryTarget: 'umd',
    // globalObject: 'this',
  },
  mode: 'production',
};
