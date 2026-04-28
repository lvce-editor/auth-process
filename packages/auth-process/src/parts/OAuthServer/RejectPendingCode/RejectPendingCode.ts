import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { clearPendingCodePromise } from '../ClearPendingCodePromise/ClearPendingCodePromise.ts'

export const rejectPendingCode = (state: OAuthServerState, error: unknown): void => {
  if (!state.rejectCode) {
    return
  }
  const { rejectCode } = state
  clearPendingCodePromise(state)
  rejectCode(error)
}