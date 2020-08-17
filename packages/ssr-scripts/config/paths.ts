import defaultPaths, { resolveApp } from '@lbwa/ssr-shared/dist/paths'
import { URL } from 'url'

const homepage: string = require(resolveApp(`package.json`)).homepage
const publicUrl =
  process.env.NODE_ENV === `development`
    ? homepage.startsWith('.')
      ? `/`
      : new URL(homepage).pathname
    : homepage.startsWith('.')
    ? homepage
    : new URL(homepage || process.env.PUBLIC_URL || `/`).pathname

export const moduleFileExtensions = [`js`, `jsx`, `ts`, `tsx`, `json`]

export default {
  ...defaultPaths,
  publicUrl
}
