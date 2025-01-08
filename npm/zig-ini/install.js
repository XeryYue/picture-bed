const fs = require('fs')

if (fs.existsSync('./dist/install.js')) {
  require('./dist/install')
}
