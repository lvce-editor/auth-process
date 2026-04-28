import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'

export const clearPendingCodePromise = (state: OAuthServerState): void => {
  state.codePromise = undefined
  state.resolveCode = undefined
  state.rejectCode = undefined
}
