import * as Assert from '../../Assert/Assert.ts'
import { getOrCreateCodePromise } from '../GetOrCreateCodePromise/GetOrCreateCodePromise.ts'
import { states } from '../State/State.ts'

export const getCode = async (id: string): Promise<string> => {
  Assert.string(id)
  const state = states[id]
  if (!state || !state.server) {
    throw new Error(`oauth server ${id} not found`)
  }
  if (state.codeQueue.length > 0) {
    const code = state.codeQueue.shift()
    if (code === undefined) {
      throw new Error('expected oauth code to be queued')
    }
    return code
  }
  return getOrCreateCodePromise(state)
}
