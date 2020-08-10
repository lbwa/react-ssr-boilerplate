process.env.BABEL_ENV = `production`
process.env.NODE_EVN = `production`

process.on(`unhandledRejection`, (err) => {
  throw err
})

const webpack = require(`webpack`)
const fs = require(`fs-extra`)
const paths = require(`../config/paths`)
const configFactory = require(`../config/webpack.universal`)

function formatWebpackMessages(json) {
  return json
}

// configurations
const config = configFactory(`production`)

// production building process

function build() {
  console.info(`Create a production build ...`)

  const compiler = webpack(config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages
      if (err) {
        if (!err.message) {
          return reject(err)
        }

        let errMessage = err.message

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: []
        })
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        )
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
  .then(() => console.log(`Build completed.`))
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
