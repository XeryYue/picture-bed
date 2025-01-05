const esbuild = require('esbuild')
const path = require('path')

esbuild.buildSync({
  outdir: path.join(__dirname, 'dist'),
  entryPoints: [path.join(__dirname, 'src', 'index.ts')]
})
