import * as Assert from '../Assert/Assert.ts'
import { getOrCreateCodePromise } from '../GetOrCreateCodePromise/GetOrCreateCodePromise.ts'
import { OAuthExpectedQueuedCodeError } from '../OAuthExpectedQueuedCodeError/OAuthExpectedQueuedCodeError.ts'
import { OAuthServerNotFoundError } from '../OAuthServerNotFoundError/OAuthServerNotFoundError.ts'
import { get, set } from '../State/State.ts'

export const getCode = async (id: string): Promise<string> => {
  Assert.string(id)
  const state = get(id)
  if (!state.server) {
    throw new OAuthServerNotFoundError(id)
  }
  if (state.codeQueue.length > 0) {
    const [code, ...codeQueue] = state.codeQueue
    if (code === undefined) {
      throw new OAuthExpectedQueuedCodeError()
    }
    set(id, {
      ...state,
      codeQueue,
    })
    return code
  }
  return getOrCreateCodePromise(id, state)
}
