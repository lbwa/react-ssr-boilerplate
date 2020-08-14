process.env.BABEL_ENV = `production`
process.env.NODE_ENV = `production`

process.on(`unhandledRejection`, (err) => {
  throw err
})

// ensure environment variables available.
import '../utils/set-env'

import createStaticBundle from '../utils/create-static-bundle'
import clientConfigFactory from '../config/webpack.client'

createStaticBundle(clientConfigFactory(`production`))
