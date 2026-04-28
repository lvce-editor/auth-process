import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { clearPendingCodePromise } from '../ClearPendingCodePromise/ClearPendingCodePromise.ts'
import { set } from '../State/State.ts'

export const resolveCode = (id: string, state: OAuthServerState, code: string): void => {
  if (state.resolveCode) {
    const { resolveCode } = state
    clearPendingCodePromise(id, state)
    resolveCode(code)
    return
  }
  set(id, {
    ...state,
    codeQueue: [...state.codeQueue, code],
  })
}
