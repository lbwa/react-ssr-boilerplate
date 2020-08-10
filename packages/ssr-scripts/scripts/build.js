process.env.BABEL_ENV = `production`
process.env.NODE_ENV = `production`

process.on(`unhandledRejection`, (err) => {
  throw err
})

// ensure environment variables available.
require(`../utils/set-env`)

const webpack = require(`webpack`)
const fs = require(`fs-extra`)
const chalk = require(`chalk`)
const paths = require(`../config/paths`)
const configFactory = require(`../config/webpack.universal`)

// configurations
const config = configFactory(`production`)

// production building process
function build() {
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
        messages = stats.toJson({ all: false, warnings: true, errors: true })
      }

      if (messages.errors.length) {
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
  .then(() => console.log(chalk.green(`Compiled successfully.\n`)))
  .catch((err) => {
    if (err && err.message) {
      console.log(chalk.red(`Compiled with errors.\n`))
      console.log(err.message)
    }
    process.exit(1)
  })
