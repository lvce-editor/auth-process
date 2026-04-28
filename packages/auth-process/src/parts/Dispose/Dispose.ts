import * as Assert from '../Assert/Assert.ts'
import { getOrCreateState } from '../GetOrCreateState/GetOrCreateState.ts'
import { OAuthServerDisposedError } from '../OAuthServerDisposedError/OAuthServerDisposedError.ts'
import { rejectPendingCode } from '../RejectPendingCode/RejectPendingCode.ts'
import { remove, set } from '../State/State.ts'

export const dispose = async (id: string): Promise<void> => {
  Assert.string(id)
  const state = getOrCreateState(id)
  if (!state.server) {
    remove(id)
    return
  }
  const { server } = state
  set(id, {
    ...state,
    codeQueue: [],
    portPromise: undefined,
    server: undefined,
  })
  rejectPendingCode(id, state, new OAuthServerDisposedError())
  const { promise, reject, resolve } = Promise.withResolvers<void>()
  server.close((error?: Error) => {
    if (error) {
      reject(error)
      return
    }
    resolve(undefined)
  })
  await promise
  remove(id)
}
