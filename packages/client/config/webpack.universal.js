const path = require(`path`)
const webpack = require(`webpack`)

const __DEV__ = process.env.NODE_ENV === `development`

function resolveApp(p) {
  return path.resolve(__dirname, `..`, p)
}

const universal = {
  mode: __DEV__ ? `development` : `production`,

  output: {
    path: resolveApp(`../dist`),
    publicPath: `/public/`,
    filename: `[name].[${__DEV__ ? `hash` : `contenthash`}:8].js`
  },

  module: {},

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(__DEV__),
      __VERSION__: JSON.stringify(require(`../package.json`).version)
    })
  ],

  resolve: {
    extensions: [`.ts`, `.tsx`]
  }
}

module.exports = universal
