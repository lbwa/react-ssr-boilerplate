import webpack from 'webpack'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import paths, { moduleFileExtensions } from './paths'
import { getClientEnvironment } from '../utils/set-env'

const useSourceMap = process.env.CREATE_SOURCE_MAP !== `false`

export default function createUniversalConfig(
  mode: `development` | `production`
): webpack.Configuration {
  const isEnvDevelopment = mode === `development`
  const isEnvProduction = mode === `production`
  const env = getClientEnvironment(paths.publicUrl.replace(/\/$/, ''))

  function getStyleLoader(cssOptions: object) {
    const loaders = [
      isEnvDevelopment && require.resolve(`style-loader`),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: {}
      },
      {
        loader: require.resolve(`css-loader`),
        options: cssOptions
      },
      {
        loader: require.resolve(`postcss-loader`),
        options: {
          // necessary for external css imports to work
          ident: `postcss`,
          plugins: () => [
            require(`postcss-flexbugs-fixes`),
            require(`postcss-preset-env`)({
              autoprefixer: {
                flexbox: `no-2009`
              },
              stage: 3
            }),
            require(`postcss-normalize`)
          ],
          sourceMap: isEnvProduction && useSourceMap
        }
      }
    ].filter(Boolean) as webpack.RuleSetRule['use']

    return loaders
  }

  return {
    mode: (isEnvProduction
      ? `production`
      : isEnvDevelopment
      ? `development`
      : 'none') as `development` | `production` | `none` | undefined,

    // fail out the first error instead of tolerating it. This will force
    // webpack to exit its bundling process.
    bail: isEnvProduction,

    resolve: {
      extensions: moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {}
    },

    module: {
      rules: [
        // disable require.ensure, use `import()` instead
        { parser: { requireEnsure: false } },

        // TODO: add eslint-loader

        {
          oneOf: [
            // babel with plugins(preset) only support the typescript syntax
            // without type-check. we'll use fork-ts-checker-webpack-plugin to
            // speedup type-check process.
            // https://babeljs.io/docs/en/babel-plugin-transform-typescript
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              // compile application code
              include: paths.appSrc,
              loader: require.resolve(`babel-loader`),
              options: {
                presets: [require.resolve(`babel-preset-react-app`)],
                // webpack features(not babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader
                cacheDirectory: true,
                cacheCompression: false,
                compact: isEnvProduction
              }
            },
            {
              test: /\.(js|mjs)$/,
              // compile outside of the application code
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true }
                  ]
                ],
                cacheDirectory: true,
                cacheCompression: false,
                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: useSourceMap,
                inputSourceMap: useSourceMap
              }
            },
            {
              test: /\.css$/,
              use: getStyleLoader({
                importLoaders: 1,
                sourceMap: isEnvProduction && useSourceMap
              }),
              sideEffects: true
            },
            {
              loader: require.resolve(`file-loader`),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: `static/media/[name].[hash:8].[ext]`
              }
            }
            // Make sure to add the new loader(s) **before** the file loader.
          ]
        }
      ]
    },

    plugins: [
      // make specific environment variables available in the JS code
      new webpack.DefinePlugin(env.stringified),
      // speedup type checking in a separate processing
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          enabled: true,
          configFile: paths.appTsConfig
        },
        async: isEnvDevelopment
      }),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: `static/css/[name].[contenthash:8].css`,
          chunkFilename: `static/css/[name].[contenthash:8].chunk.css`
        })
    ].filter(Boolean) as webpack.Plugin[],

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
