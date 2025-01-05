const fs = require('fs')
const { defineConfig } = require('jiek')
const path = require('path')

const wasm = fs.readFileSync(path.join(__dirname, 'zig-ini.wasm')).toString('base64')

module.exports = defineConfig({
  build: {
    replacements: {
      zigIni: JSON.stringify(wasm)
    },
    output: {
      minify: false
    }
  }
})
