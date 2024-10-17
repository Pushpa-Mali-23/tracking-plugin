
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'tracking-plugin.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'TrackingPlugin',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  mode: 'production',
};
