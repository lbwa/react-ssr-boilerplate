#!/usr/bin/env node

import spawn from 'cross-spawn'
import chalk from 'chalk'

process.on('unhandledRejection', (err) => {
  throw err
})

function isValidCommand(script: string) {
  return [`start`, `build`].includes(script)
}

const args = process.argv.slice(2)
const scriptIndex = args.findIndex(isValidCommand)
const script = scriptIndex === -1 ? args[0] : args[scriptIndex]
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : []

if (isValidCommand(script)) {
  // https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve(`../scripts/${script}`))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: `inherit` }
  )
  if (result.signal) {
    console.log(`Unexpected process exited`)
    process.exit(1)
  }
} else {
  console.log(chalk.red(`Unknown script ${script}`))
  process.exit(1)
}
