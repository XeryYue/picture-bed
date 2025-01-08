import { format as _format } from './bindings'

export type QuoteStyle = 'none' | 'single' | 'double'

export type CommentStyle = 'hash' | 'semi'
export interface FormatOptions {
  quoteStyle: QuoteStyle
  commentStyle: CommentStyle
}

const defaultOptions = {
  quoteStyle: 'double',
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
