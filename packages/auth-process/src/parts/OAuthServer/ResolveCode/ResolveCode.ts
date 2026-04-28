import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { clearPendingCodePromise } from '../ClearPendingCodePromise/ClearPendingCodePromise.ts'

export const resolveCode = (state: OAuthServerState, code: string): void => {
  if (state.resolveCode) {
    const { resolveCode } = state
    clearPendingCodePromise(state)
    resolveCode(code)
    return
  }
  state.codeQueue.push(code)
}