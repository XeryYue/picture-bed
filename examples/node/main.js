const wasm = require('@zig-ini/wasm')
const native = require('zig-ini')

const text = `
name = kanno
address = 127.0.0.1`

const result = wasm.format(text, { quoteStyle: 'single', commentStyle: 'semi' })

console.log(result)

const result2 = native.format(text, { quoteStyle: 'single', commentStyle: 'semi' })

console.log(result2)
