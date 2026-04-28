import type { Server } from 'node:http'
import type { Resolve } from '../Resolve/Resolve.ts'

export interface OAuthServerState {
  codePromise: Promise<string> | undefined
  codeQueue: string[]
  errorHtml: string
  portPromise: Promise<number> | undefined
  rejectCode: ((reason?: unknown) => void) | undefined
  resolveCode: Resolve<string> | undefined
  server: Server | undefined
  successHtml: string
}