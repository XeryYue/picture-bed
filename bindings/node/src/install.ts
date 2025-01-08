import child_process from 'child_process'
import fs from 'fs'
import path from 'path'

const UNIX_LIKE_PKG: Record<string, string> = {
  'x64-darwin': '@zig-ini/x86_64-macos',
  'arm64-darwin': '@zig-ini/aarch64-macos',
  'x64-linux-gnu': '@zig-ini/x86_64-linux'
}

function isMusl() {
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      const lddPath = child_process.execSync('which ldd').toString().trim()
      return fs.readFileSync(lddPath, 'utf8').includes('musl')
    } catch {
      return true
    }
  } else {
    // @ts-expect-error safe
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

function downloadBinPath(pkg: string) {
  const libPath = path.dirname(require.resolve('zig-ini'))
  return path.join(libPath, `downloaded-${pkg.replace('/', '-')}}`)
}

function getCurrentPlatformPkg() {
  let platformQuery = process.arch + '-' + process.platform
  if (process.platform === 'linux') {
    platformQuery += `-${isMusl() ? 'musl' : 'gnu'}`
  }
  if (platformQuery in UNIX_LIKE_PKG) {
    return UNIX_LIKE_PKG[platformQuery]
  }
  throw new Error(`Unsupported platform: ${platformQuery}`)
}

function removeRecursive(dir: string): void {
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry)
    let stats
    try {
      stats = fs.lstatSync(entryPath)
    } catch {
      continue // Guard against https://github.com/nodejs/node/issues/4760
    }
    if (stats.isDirectory()) { removeRecursive(entryPath) }
    else { fs.unlinkSync(entryPath) }
  }
  fs.rmdirSync(dir)
}

function installUsingNpm(pkg: string, binPath: string) {
  const env = { ...process.env, npm_config_global: undefined }
  const libDir = path.dirname(require.resolve('zig-ini'))
  const installDir = path.join(libDir, 'npm-install')
  fs.mkdirSync(installDir)
  try {
    fs.writeFileSync(path.join(installDir, 'package.json'), '{}')
    child_process.execSync(`npm install --loglevel=error --prefer-offline --no-audit --progress=false ${pkg}`, {
      cwd: installDir,
      stdio: 'pipe',
      env
    })
    const installBinPath = path.join(installDir, 'node_modules', pkg)
    fs.renameSync(installBinPath, binPath)
  } finally {
    try {
      removeRecursive(installDir)
    } catch {
    }
  }
}

function validateBinary() {
  const pkg = getCurrentPlatformPkg()
  let binPath: string
  try {
    binPath = require.resolve(pkg)
  } catch {
    binPath = downloadBinPath(pkg)
    try {
      installUsingNpm(pkg, binPath)
    } catch {
      throw new Error(`Failed to install package "${pkg}"`)
    }
  }
}

validateBinary()
