import { createServer } from 'node:http'
import * as Assert from '../Assert/Assert.ts'
import { getOrCreateState } from '../GetOrCreateState/GetOrCreateState.ts'
import { handleRequest } from '../HandleRequest/HandleRequest.ts'
import { listen } from '../ListenServer/ListenServer.ts'
import { states } from '../State/State.ts'

export const create = async (id: string, successHtml: string, errorHtml: string): Promise<number> => {
  Assert.string(id)
  Assert.string(successHtml)
  Assert.string(errorHtml)
  const state = getOrCreateState(id)
  state.successHtml = successHtml
  state.errorHtml = errorHtml
  if (state.portPromise) {
    return state.portPromise
  }
  const server = createServer((request, response) => {
    handleRequest(id, request, response)
  })
  state.server = server
  state.portPromise = listen(server)
  try {
    return await state.portPromise
  } catch (error) {
    state.server = undefined
    state.portPromise = undefined
    delete states[id]
    throw error
  }
}
