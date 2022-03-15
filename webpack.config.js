const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'instant-games-bridge.js',
        path: path.resolve(__dirname, 'dist'),
    },
}