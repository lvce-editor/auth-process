import { createServer } from 'node:http'
import * as Assert from '../Assert/Assert.ts'
import { getOrCreateState } from '../GetOrCreateState/GetOrCreateState.ts'
import { handleRequest } from '../HandleRequest/HandleRequest.ts'
import { listen } from '../ListenServer/ListenServer.ts'
import { remove, set } from '../State/State.ts'

export const create = async (id: string, successHtml: string, errorHtml: string): Promise<number> => {
  Assert.string(id)
  Assert.string(successHtml)
  Assert.string(errorHtml)
  const state = getOrCreateState(id)
  const nextState = {
    ...state,
    errorHtml,
    successHtml,
  }
  set(id, nextState)
  if (nextState.portPromise) {
    return nextState.portPromise
  }
  const server = createServer((request, response) => {
    handleRequest(id, request, response)
  })
  const portPromise = listen(server)
  set(id, {
    ...nextState,
    portPromise,
    server,
  })
  try {
    return await portPromise
  } catch (error) {
    remove(id)
    throw error
  }
}
