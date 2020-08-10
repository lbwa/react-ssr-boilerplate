const path = require(`path`)
const fs = require(`fs`)

const appDir = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDir, relativePath)

const moduleFileExtensions = [`js`, `jsx`, `ts`, `tsx`, `json`]
const publicUrl =
  require(resolveApp(`package.json`)).homepage || process.env.PUBLIC_URL || `/`

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
