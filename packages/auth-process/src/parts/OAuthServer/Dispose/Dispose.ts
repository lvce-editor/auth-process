import * as Assert from '../../Assert/Assert.ts'
import { getOrCreateState } from '../GetOrCreateState/GetOrCreateState.ts'
import { OAuthServerDisposedError } from '../OAuthServerDisposedError/OAuthServerDisposedError.ts'
import { rejectPendingCode } from '../RejectPendingCode/RejectPendingCode.ts'
import { states } from '../State/State.ts'

export const dispose = async (id: string): Promise<void> => {
  Assert.string(id)
  const state = getOrCreateState(id)
  if (!state.server) {
    delete states[id]
    return
  }
  const { server } = state
  state.server = undefined
  state.portPromise = undefined
  state.codeQueue = []
  rejectPendingCode(state, new OAuthServerDisposedError())
  const { promise, reject, resolve } = Promise.withResolvers<void>()
  server.close((error?: Error) => {
    if (error) {
      reject(error)
      return
    }
    resolve(undefined)
  })
  await promise
  delete states[id]
}
