import fs from 'fs'
import paths from '../config/paths'

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  throw new Error(
    `The NODE_ENV environment variable is required but was not specified.`
  )
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  NODE_ENV !== `test` && `${paths.dotenv}.local`,
  paths.dotenv
].filter(Boolean) as string[]

// load environment variables from dotenv files.
dotenvFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    /**
     * use `dotenv-expand` support Variable expansion
     * @see https://github.com/motdotla/dotenv-expand/blob/master/test/.env
     */
    require(`dotenv-expand`)(
      require(`dotenv`).config({
        path: file
      })
    )
  }
})

const CLIENT_AVAILABLE_ENV_PREFIX = /^SSR_APP_/i
export function getClientEnvironment(publicUrl: string) {
  const raw = Object.keys(process.env)
    .filter((key) => CLIENT_AVAILABLE_ENV_PREFIX.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key]
        return env
      },
      {
        NODE_ENV: process.env.NODE_ENV || `development`,
        PUBLIC_URL: publicUrl
      } as Record<string, unknown>
    )
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {} as Record<string, string>),
    __DEV__: JSON.stringify(process.env.NODE_ENV === `development`)
  }

  return { raw, stringified }
}
