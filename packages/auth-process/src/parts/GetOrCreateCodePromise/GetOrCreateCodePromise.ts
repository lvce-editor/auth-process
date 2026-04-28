import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { set } from '../State/State.ts'

export const getOrCreateCodePromise = (id: string, state: OAuthServerState): Promise<string> => {
  if (!state.codePromise) {
    const { promise, reject, resolve } = Promise.withResolvers<string>()
    set(id, {
      ...state,
      codePromise: promise,
      rejectCode: reject,
      resolveCode: resolve,
    })
    return promise
  }
  return state.codePromise
}
