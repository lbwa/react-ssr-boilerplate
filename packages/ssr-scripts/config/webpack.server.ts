import nodeExternals from 'webpack-node-externals'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import createUniversalConfig from './webpack.universal'
import paths from './paths'

export default function createServerConfig(mode: 'development' | 'production') {
  return merge(createUniversalConfig(mode), {
    // tell webpack not to touch any nodejs built-in modules
    target: `node`,

    entry: {
      serverEntry: paths.appEntry
    },

    output: {
      path: paths.appBuild,
      publicPath: paths.publicUrl,
      filename: `[name].server.js`,
      libraryTarget: `commonjs2`
    },

    // ignore all modules in node_modules folder, because we already have all
    // node_modules in the nodejs runtime.We want webpack keep all `require`
    // statement, don't want bundle any node_modules code (for better server
    // performance).
    // https://jlongster.com/Backend-Apps-with-Webpack--Part-I
    externals: nodeExternals({
      allowlist: /\.(css|less|sass|scss)$/
    }),

    plugins: [
      new webpack.DefinePlugin({
        __BROWSER__: false
      })
    ]
  })
}
