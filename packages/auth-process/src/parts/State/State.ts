import type { OAuthServerState } from '../OAuthServerState/OAuthServerState.ts'
import { OAuthServerNotFoundError } from '../OAuthServerNotFoundError/OAuthServerNotFoundError.ts'

const states: Record<string, OAuthServerState> = Object.create(null)

export const get = (id: string): OAuthServerState => {
  const state = states[id]
  if (!state) {
    throw new OAuthServerNotFoundError(id)
  }
  return state
}

export const set = (id: string, state: OAuthServerState): void => {
  states[id] = state
}

export const has = (id: string): boolean => {
  return id in states
}
export const remove = (id: string): void => {
  delete states[id]
}
