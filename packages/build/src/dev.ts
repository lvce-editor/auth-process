import { execa } from 'execa'
import { join } from 'node:path'
import { root } from './root.ts'

const main = async () => {
  execa(`npm`, ['run', 'build:watch'], {
    cwd: root,
    stdio: 'inherit',
  })
  execa(
    'node',
    ['node_modules/@lvce-editor/server/bin/server.js', '--test-path=packages/e2e', `--auth-process=${join(root, 'packages/auth-process/dist/index.js')}`],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
}

main()
