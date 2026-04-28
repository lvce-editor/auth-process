import type { Server } from 'node:http'
import type { Resolve } from '../Resolve/Resolve.ts'

export interface OAuthServerState {
  readonly codePromise: Promise<string> | undefined
  readonly codeQueue: readonly string[]
  readonly errorHtml: string
  readonly portPromise: Promise<number> | undefined
  readonly rejectCode: ((reason?: unknown) => void) | undefined
  readonly resolveCode: Resolve<string> | undefined
  readonly server: Server | undefined
  readonly successHtml: string
}
