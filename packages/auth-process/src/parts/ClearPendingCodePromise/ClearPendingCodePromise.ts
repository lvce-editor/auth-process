import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { set } from '../State/State.ts'

export const clearPendingCodePromise = (id: string, state: OAuthServerState): void => {
  set(id, {
    ...state,
    codePromise: undefined,
    rejectCode: undefined,
    resolveCode: undefined,
  })
}
