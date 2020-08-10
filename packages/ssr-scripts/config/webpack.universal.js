const path = require(`path`)
const webpack = require(`webpack`)
const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const InlineChunkHtmlPlugin = require(`../utils/inline-chunk-html-plugin`)
const InterpolateHtmlPlugin = require(`../utils/interpolate-html-plugin`)
const paths = require(`./paths`)

const useSourceMap = process.env.CREATE_SOURCE_MAP !== `false`

module.exports = function createWebpackConfig(mode) {
  const isEnvDevelopment = mode === `development`
  const isEnvProduction = mode === `production`

  return {
    mode: isEnvProduction ? `production` : isEnvDevelopment && `development`,

    bail: isEnvProduction,

    devtool: isEnvProduction
      ? useSourceMap
        ? `source-map`
        : false
      : isEnvDevelopment && `cheap-module-source-map`,

    entry: [
      // TODO: add `webpack-hot-middleware/client` entry for development
      // universal application entry
      paths.appEntry
    ].filter(Boolean),

    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      pathinfo: isEnvDevelopment,
      filename: isEnvProduction
        ? `[name].[contenthash:8].js`
        : isEnvDevelopment && `[name].[hash:8].js`,
      chunkFilename: isEnvProduction
        ? `[name].[contenthash:8].chunk.js`
        : isEnvDevelopment && `[name].[hash:8].chunk.js`,
      publicPath: paths.publicUrl,
      globalObject: `this`
    },

    optimization: {
      minimize: isEnvProduction,
      splitChunks: {
        chunks: `all`,
        name: false
      },
      runtimeChunk: {
        name: (entry) => `runtime-${entry.name}`
      }
    },

    resolve: {
      extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {
        'react-dom$': `react-dom/profiling`,
        'scheduler/tracing': `scheduler/tracing-profiling`
      }
    },

    module: {
      rules: [
        // disable require.ensure, use `import()` instead
        { parser: { requireEnsure: false } },
        // TODO: add eslint-loader
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: path.appSrc,
          loader: require.resolve(`babel-loader`),
          options: {
            presets: [require.resolve(`babel-preset-react-app`)],
            // webpack features(not babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader
            cacheDirectory: true,
            cacheCompression: false,
            compact: isEnvProduction
          }
        }
      ]
    },

    plugins: [
      new webpack.ProgressPlugin(),
      new HtmlWebpackPlugin(
        Object.assign(
          { inject: true, template: paths.appHtml },
          isEnvProduction
            ? {
                minify: {
                  removeCommends: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true
                }
              }
            : undefined
        )
      ),
      // inline the webpack runtime chunk, this script is too small to warrant a
      // network request.
      isEnvProduction &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      // make specific environment variables available in index.html
      new InterpolateHtmlPlugin(
        HtmlWebpackPlugin,
        // TODO: migrate all env variables to single file
        {
          PUBLIC_URL: paths.publicUrl
        }
      ),

      // make specific environment variables available in the JS code
      new webpack.DefinePlugin(
        // TODO: migrate all env variables to single file
        {
          __DEV__: JSON.stringify(process.env.NODE_ENV === `development`)
        }
      ),

      // TODO: HotModuleReplacementPlugin in development
      // TODO: mini-css-extract-plugin in production

      // speedup type checking in a separate processing
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          enabled: true,
          configFile: paths.appTsConfig
        },
        async: isEnvDevelopment
      })
    ].filter(Boolean),

    node: {
      module: `empty`,
      dgram: `empty`,
      dns: `empty`,
      fs: `empty`,
      http2: `empty`,
      net: `empty`,
      tls: `empty`,
      child_process: `empty`
    }
  }
}
