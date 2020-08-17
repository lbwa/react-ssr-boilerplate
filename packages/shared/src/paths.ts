import path from 'path'
import fs from 'fs'

export const appDir = fs.realpathSync(process.cwd())

export const resolveApp = (relativePath: string) =>
  path.resolve(appDir, relativePath)

export default {
  dotenv: resolveApp(`.env`),
  appPath: resolveApp(`.`),
  appBuild: resolveApp(`dist`),
  appPublic: resolveApp(`public`),
  appHtml: resolveApp(`public/index.html`),
  appSrc: resolveApp(`src`),
  appEntry: resolveApp(`src/index`),
  appPackageJson: resolveApp(`package.json`),
  appTsConfig: resolveApp(`tsconfig.json`),
  appNodeModules: resolveApp(`node_modules`)
}
