import * as Assert from '../../Assert/Assert.ts'
import { getOrCreateCodePromise } from '../GetOrCreateCodePromise/GetOrCreateCodePromise.ts'
import { OAuthExpectedQueuedCodeError } from '../OAuthExpectedQueuedCodeError/OAuthExpectedQueuedCodeError.ts'
import { OAuthServerNotFoundError } from '../OAuthServerNotFoundError/OAuthServerNotFoundError.ts'
import { states } from '../State/State.ts'

export const getCode = async (id: string): Promise<string> => {
  Assert.string(id)
  const state = states[id]
  if (!state || !state.server) {
    throw new OAuthServerNotFoundError(id)
  }
  if (state.codeQueue.length > 0) {
    const code = state.codeQueue.shift()
    if (code === undefined) {
      throw new OAuthExpectedQueuedCodeError()
    }
    return code
  }
  return getOrCreateCodePromise(state)
}
