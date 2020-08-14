process.env.BABEL_ENV = `production`
process.env.NODE_ENV = `production`

process.on(`unhandledRejection`, (err) => {
  throw err
})

// ensure environment variables available.
import '../utils/set-env'

import webpack from 'webpack'
import fs from 'fs-extra'
import chalk from 'chalk'
import paths from '../config/paths'
import configFactory from '../config/webpack.client'

// configurations
const config = configFactory(`production`)

// production building process
function build(): Promise<{ stats: webpack.Stats; warnings: string[] }> {
  console.info(chalk.blue(`Create a production build ...`))

  const compiler = webpack(config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages
      if (err) {
        if (!err.message) {
          return reject(err)
        }

        let errMessage = err.message

        messages = {
          errors: [errMessage],
          warnings: []
        }
      } else {
        // All available options: https://webpack.js.org/configuration/stats/
        messages = stats.toJson({ all: false, warnings: true, errors: true })
      }

      if (messages.errors.length) {
        // Only keep the first error. Others are often  indicative of the same
        // problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }

        return reject(new Error(messages.errors.join(`\n\n`)))
      }

      return resolve({
        stats,
        warnings: messages.warnings
      })
    })
  })
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml
  })
}

// remove all content but keep the directory
fs.emptyDirSync(paths.appBuild)
copyPublicFolder()
build()
  .then(({ stats, warnings }) => {
    if (warnings.length) {
      console.log(chalk.yellow(`Compiled with warning.\n`))
      console.log(warnings.join(`\n\n`))
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow(`keywords`)) +
          ' to learn more about each warning.'
      )
    } else {
      console.log(
        // All available options: https://webpack.js.org/configuration/stats/
        stats.toString(
          Object.assign({
            assets: true,
            colors: true,
            hash: true,
            timings: true,
            version: true
          })
        )
      )
      console.log(chalk.green(`\nCompiled successfully.\n`))
    }
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(chalk.red(`Compiled with error.\n`))
      console.log(err.message)
    }
    process.exit(1)
  })
