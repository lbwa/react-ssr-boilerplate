process.env.BABEL_ENV = `development`
process.env.NODE_ENV = `development`

process.on(`unhandledRejection`, (err) => {
  throw err
})

require(`../utils/set-env`)

const chalk = require(`chalk`)
const webpack = require(`webpack`)
const WebpackDevServer = require(`webpack-dev-server`)
const paths = require(`../config/paths`)
const { clearConsole } = require(`../utils/clear-console`)

const PORT = +process.env.PORT || 3000
const HOST = process.env.HOST || `0.0.0.0`
const isInteractive = process.stdout.isTTY

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  )
}

const configFactory = require(`../config/webpack.client`)

function develop() {
  const compiler = createCompiler()

  const devServer = new WebpackDevServer(compiler, {
    // all available options
    // https://webpack.js.org/configuration/dev-server/#devserver
    stats: {
      assets: true,
      cachedAssets: false,
      children: false,
      chunks: false,
      colors: true,
      modules: false,
      warnings: true,
      entrypoints: true
    },
    disableHostCheck: true,
    compress: true,
    publicPath: paths.publicUrl,
    host: HOST,
    port: PORT,
    sockPort: PORT,
    contentBase: paths.appPublic,
    contentBasePublicPath: paths.publicUrl,
    watchContentBase: true,
    hot: true,
    clientLogLevel: `debug`,
    overlay: false,
    headers: {
      'access-control-allow-origin': `*`
    }
  })

  devServer.listen(PORT, (err) => {
    if (err) {
      throw err
    }
    if (isInteractive) {
      clearConsole()
    }

    console.log(chalk.cyan(`Starting the development server ...\n`))
  })
  ;[`SIGINT`, `SIGTERM`].forEach(function (sig) {
    process.on(sig, function () {
      devServer.close()
      process.exit()
    })
  })
}

function createCompiler() {
  let compiler
  try {
    compiler = webpack(configFactory(`development`))
  } catch (error) {
    console.log(chalk.red(`Failed to compile.\n`))
    console.log(error.message || error)
    process.exit(1)
  }

  /**
   * `invalid` event fires when you have changed a file, and webpack is
   * recompiling a bundle. WebpackDevServer takes care to pause serving the
   * bundle, so if you refresh, it'll wait instead of serving the old one.
   * `invalid` is short for `bundle invalidated`, it doesn't imply any errors.
   */
  compiler.hooks.invalid.tap(`invalid`, () => {
    if (isInteractive) {
      clearConsole()
    }
    console.log(chalk.cyan(`Compiling ...`))
  })

  /**
   * `done` event fires when webpack has finished recompiling the bundle.
   * Whether or not you have warnings or errors, you will get this event
   */
  compiler.hooks.done.tap(`done`, async (stats) => {
    if (isInteractive) {
      clearConsole()
    }
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true
    })

    if (statsData.errors.length) {
      // only keep the first error. Other are often indicative of the same
      // problem, but confuse the reader with noise.
      if (statsData.errors.length > 1) {
        statsData.errors.length = 1
      }
      console.error(chalk.red(`Failed to compile.\n`))
      console.error(statsData.error.join(`\n\n`))
      return
    }

    if (statsData.warnings.length) {
      console.warn(chalk.yellow(`Compiled with warnings.\n`))
      console.warn(statsData.warnings.join(`\n\n`))
    }
  })

  return compiler
}

develop()
