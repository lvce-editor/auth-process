import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'

export const getOrCreateCodePromise = (state: OAuthServerState): Promise<string> => {
  if (!state.codePromise) {
    const { promise, reject, resolve } = Promise.withResolvers<string>()
    state.codePromise = promise
    state.resolveCode = resolve
    state.rejectCode = reject
  }
  return state.codePromise
}
