const headers = require('node-api-headers')

const allSymbols = new Set()

const { v9: latest } = headers.symbols

const { js_native_api_symbols, node_api_symbols } = latest

for (const symbol of js_native_api_symbols) {
  allSymbols.add(symbol)
}

for (const symbol of node_api_symbols) {
  allSymbols.add(symbol)
}

process.stdout.write('EXPORTS\n    ' + Array.from(allSymbols).join('\n    '))
