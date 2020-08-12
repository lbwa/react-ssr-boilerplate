const path = require(`path`)
const fs = require(`fs`)
const { URL } = require(`url`)

const appDir = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDir, relativePath)

const moduleFileExtensions = [`js`, `jsx`, `ts`, `tsx`, `json`]
const homepage = require(resolveApp(`package.json`)).homepage
const publicUrl =
  process.env.NODE_ENV === `development`
    ? homepage.startsWith('.')
      ? `/`
      : new URL(homepage).pathname
    : homepage.startsWith('.')
    ? homepage
    : new URL(homepage || process.env.PUBLIC_URL || `/`).pathname

module.exports = {
  dotenv: resolveApp(`.env`),
  appPath: resolveApp(`.`),
  appBuild: resolveApp(`dist`),
  appPublic: resolveApp(`public`),
  appHtml: resolveApp(`public/index.html`),
  appSrc: resolveApp(`src`),
  appEntry: resolveApp(`src/index`),
  appPackageJson: resolveApp(`package.json`),
  appTsConfig: resolveApp(`tsconfig.json`),
  appNodeModules: resolveApp(`node_modules`),
  publicUrl
}

module.exports.moduleFileExtensions = moduleFileExtensions
