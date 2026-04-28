import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { states } from '../State/State.ts'

export const getOrCreateState = (id: string): OAuthServerState => {
  if (!states[id]) {
    states[id] = {
      codePromise: undefined,
      codeQueue: [],
      errorHtml: '',
      portPromise: undefined,
      rejectCode: undefined,
      resolveCode: undefined,
      server: undefined,
      successHtml: '',
    }
  }
  return states[id]
}