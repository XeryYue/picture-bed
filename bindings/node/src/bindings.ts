/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-require-imports */

const { arch, platform } = process
import fs from 'fs'

export type QuoteStyle = 'none' | 'single' | 'dobule'

export type CommentStyle = 'hash' | 'semi'
export interface FormatOptions {
  quoteStyle: QuoteStyle
  commentStyle: CommentStyle
}

interface NativeBindings {
  format: (input: string, options: Record<string, string>) => string
}

let nativeBindings: NativeBindings | null = null

function isMusl() {
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      const lddPath = require('child_process').execSync('which ldd').toString().trim() as string
      return fs.readFileSync(lddPath, 'utf8').includes('musl')
    } catch {
      return true
    }
  } else {
    // @ts-expect-error safe
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

switch (platform) {
  case 'win32': {
    switch (arch) {
      case 'x64': {
        try {
          nativeBindings = require('@zig-ini/x86_64-windows') as NativeBindings
        } catch (e) {
          throw e
        }
        break
      }
      case 'arm64': {
        try {
          nativeBindings = require('@zig-ini/aarch64-windows') as NativeBindings
        } catch (e) {
          throw e
        }
        break
      }
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`)
    }
    break
  }
  case 'darwin': {
    switch (arch) {
      case 'x64': {
        try {
          nativeBindings = require('@zig-ini/x86_64-macos') as NativeBindings
        } catch (e) {
          throw e
        }
        break
      }
      case 'arm64': {
        try {
          nativeBindings = require('@zig-ini/aarch64-macos') as NativeBindings
        } catch (e) {
          throw e
        }
        break
      }
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`)
    }
    break
  }
  case 'linux': {
    switch (arch) {
      case 'x64': {
        if (isMusl()) {
          break
        } else {
          try {
            nativeBindings = require('@zig-ini/x86_64-linux') as NativeBindings
          } catch (e) {
            throw e
          }
          break
        }
      }
    }
    break
  }
  default:
    throw new Error(`Unsupported OS: ${platform}, arch: ${arch}`)
}

if (!nativeBindings) {
  throw new Error('Failed to load native bindingss')
}

const { format: _format } = nativeBindings

const defaultOptions = {
  quoteStyle: 'dobule',
  commentStyle: 'hash'
} satisfies FormatOptions

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function format(input: string, options?: FormatOptions) {
  options = { ...defaultOptions, ...options ?? {} }
  const parsedOptions = Object.entries(options).reduce((acc, [key, value]: [string, string]) => {
    return { ...acc, [toSnakeCase(key)]: value }
  }, {} as Record<string, string>)
  return _format(input, parsedOptions)
}
