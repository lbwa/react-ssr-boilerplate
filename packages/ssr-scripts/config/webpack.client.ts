import { merge } from 'webpack-merge'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import InlineChunkHtmlPlugin from '../utils/inline-chunk-html-plugin'
import InterpolateHtmlPlugin from '../utils/interpolate-html-plugin'
import paths from './paths'
import createUniversalConfig from './webpack.universal'
import { getClientEnvironment } from '../utils/set-env'

const useSourceMap = process.env.CREATE_SOURCE_MAP !== `false`

export default function createWebpackConfig(
  mode: `production` | `development`
) {
  const isEnvDevelopment = mode === `development`
  const isEnvProduction = mode === `production`
  const env = getClientEnvironment(paths.publicUrl.replace(/\/$/, ''))

  return merge(createUniversalConfig(mode), {
    target: `web`,

    devtool: (isEnvProduction
      ? useSourceMap
        ? `source-map`
        : false
      : isEnvDevelopment &&
        `cheap-module-source-map`) as webpack.Options.Devtool,

    entry: [
      // Experimental hot reloading for React .
      // https://github.com/facebook/react/tree/master/packages/react-refresh
      // https://github.com/facebook/create-react-app/blob/v3.4.1/packages/react-scripts/config/webpack.config.js#L150-L170
      isEnvDevelopment && require.resolve(`webpack-dev-server/client`) + `?/`,
      isEnvDevelopment && require.resolve(`webpack/hot/dev-server`),
      paths.appEntry
    ].filter(Boolean) as string[],

    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      pathinfo: isEnvDevelopment,
      // for initial chunk files
      filename: isEnvProduction
        ? // [name] - chunk name
          // [contenthash] - md4-hash of the output file content
          `static/js/[name].[contenthash:8].js`
        : `[name].[hash:8].js`,
      // for non-initial chunk files(depended by initial chunks)
      chunkFilename: isEnvProduction
        ? `static/js/[name].[contenthash:8].chunk.js`
        : `[name].[hash:8].chunk.js`,
      publicPath: paths.publicUrl,
      globalObject: `this`
    },

    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2
            },
            mangle: {
              safari10: true
            },
            // Added for profiling in devtools
            keep_classnames: false,
            keep_fnames: false,
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true
            }
          },
          sourceMap: useSourceMap
        }),
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
      new HtmlWebpackPlugin(
        Object.assign(
          { inject: true, template: paths.appHtml },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
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
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      new webpack.DefinePlugin({
        __BROWSER__: true
      })
    ].filter(Boolean) as webpack.Plugin[],

    performance: {
      hints: isEnvProduction ? `warning` : false
    }
  })
}
