import webpack from 'webpack'
import { emptyDirSync, copySync } from 'fs-extra'
import chalk from 'chalk'
import paths from '../config/paths'

function createStaticBundle(config: webpack.Configuration) {
  console.log(chalk.blue(`start webpack ${config.mode} build ...`))

  const compiler = webpack(config)
  return new Promise<{ stats: webpack.Stats; warnings: string[] }>(
    (resolve, reject) => {
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
    }
  )
}

function copyPublicFolder() {
  copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml
  })
}

export default function (webpackConfig: webpack.Configuration) {
  // remove all content but keep the directory
  emptyDirSync(paths.appBuild)
  copyPublicFolder()
  return createStaticBundle(webpackConfig)
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
        console.log(chalk.red(`\nCompiled with error.\n`))
        console.log(err.message)
      }
      process.exit(1)
    })
}
