const { merge } = require(`webpack-merge`)
const webpack = require(`webpack`)
const OptimizeCssAssetsPlugin = require(`optimize-css-assets-webpack-plugin`)
const paths = require(`./paths`)
const createUniversalConfig = require(`./webpack.universal`)

const useSourceMap = process.env.CREATE_SOURCE_MAP !== `false`

module.exports = function createWebpackConfig(mode) {
  const isEnvDevelopment = mode === `development`
  const isEnvProduction = mode === `production`

  return merge(createUniversalConfig(mode), {
    target: `web`,

    devtool: isEnvProduction
      ? useSourceMap
        ? `source-map`
        : false
      : isEnvDevelopment && `cheap-module-source-map`,

    entry: [
      // Experimental hot reloading for React .
      // https://github.com/facebook/react/tree/master/packages/react-refresh
      // https://github.com/facebook/create-react-app/blob/v3.4.1/packages/react-scripts/config/webpack.config.js#L150-L170
      require.resolve(`webpack-dev-server/client`) + `?/`,
      require.resolve(`webpack/hot/dev-server`),
      paths.appEntry
    ].filter(Boolean),

    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      pathinfo: isEnvDevelopment,
      // for initial chunk files
      filename: isEnvProduction
        ? // [name] - chunk name
          // [contenthash] - md4-hash of the output file content
          `static/js/[name].[contenthash:8].js`
        : isEnvDevelopment && `[name].[hash:8].js`,
      // for non-initial chunk files(depended by initial chunks)
      chunkFilename: isEnvProduction
        ? `static/js/[name].[contenthash:8].chunk.js`
        : isEnvDevelopment && `[name].[hash:8].chunk.js`,
      publicPath: paths.publicUrl,
      globalObject: `this`
    },

    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // Only used in production mode
        new OptimizeCssAssetsPlugin({
          // This options passed to the cssProcessor(default is `cssnano`)
          cssProcessorOptions: {
            map: useSourceMap
              ? {
                  // `inline: false` forces the source map to be output into a
                  // separate file
                  inline: false,
                  // appends the sourceMappingURL to the end of the css file,
                  // helping the browser find the source map
                  annotation: true
                }
              : false
          },
          // The plugin options passed to the cssProcess
          cssProcessorPluginOptions: {
            presets: [`default`, { minifyFontValues: { removeQuotes: false } }]
          }
        })
      ],
      splitChunks: {
        chunks: `all`, // all `initial` and `async` chunks
        name: false
      },
      runtimeChunk: {
        name: (entry) => `runtime-${entry.name}`
      }
    },

    plugins: [
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        __BROWSER__: true
      })
    ].filter(Boolean),

    performance: {
      hints: isEnvProduction ? `warning` : false
    }
  })
}
