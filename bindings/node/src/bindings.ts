/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-require-imports */

const { arch, platform } = process

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
