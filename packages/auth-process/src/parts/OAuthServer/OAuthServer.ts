import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import * as Assert from '../Assert/Assert.ts'

type Resolve<T> = (value: T | PromiseLike<T>) => void

interface OAuthServerState {
  codePromise: Promise<string> | undefined
  codeQueue: string[]
  errorHtml: string
  portPromise: Promise<number> | undefined
  rejectCode: ((reason?: unknown) => void) | undefined
  resolveCode: Resolve<string> | undefined
  server: Server | undefined
  successHtml: string
}

const states: Record<string, OAuthServerState> = Object.create(null)

const getOrCreateState = (id: string): OAuthServerState => {
  if (!states[id]) {
    states[id] = {
      codePromise: undefined,
      codeQueue: [],
      errorHtml: '',
      portPromise: undefined,
      rejectCode: undefined,
      resolveCode: undefined,
      server: undefined,
      successHtml: '',
    }
  }
  return states[id]
}

const clearPendingCodePromise = (state: OAuthServerState): void => {
  state.codePromise = undefined
  state.resolveCode = undefined
  state.rejectCode = undefined
}

const resolveCode = (state: OAuthServerState, code: string): void => {
  if (state.resolveCode) {
    const { resolveCode } = state
    clearPendingCodePromise(state)
    resolveCode(code)
    return
  }
  state.codeQueue.push(code)
}

const rejectPendingCode = (state: OAuthServerState, error: unknown): void => {
  if (!state.rejectCode) {
    return
  }
  const { rejectCode } = state
  clearPendingCodePromise(state)
  rejectCode(error)
}

const getCodeFromRequest = (request: IncomingMessage): string | undefined => {
  if (!request.url) {
    return undefined
  }
  const url = new URL(request.url, 'http://localhost')
  const code = url.searchParams.get('code')
  return code || undefined
}

const handleRequest = (id: string, request: IncomingMessage, response: ServerResponse): void => {
  const state = states[id]
  let html = ''
  if (state) {
    const code = getCodeFromRequest(request)
    if (code) {
      resolveCode(state, code)
      html = state.successHtml
    } else {
      html = state.errorHtml
    }
  }
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/html; charset=utf-8',
  })
  response.end(html)
}

const listen = (server: Server): Promise<number> => {
  const { promise, reject, resolve } = Promise.withResolvers<number>()

  const onError = (error: Error): void => {
    server.off('listening', onListening)
    reject(error)
  }

  const onListening = (): void => {
    server.off('error', onError)
    const address = server.address()
    if (!address || typeof address === 'string') {
      reject(new Error('failed to determine oauth server port'))
      return
    }
    resolve(address.port)
  }

  server.once('error', onError)
  server.once('listening', onListening)
  server.listen(0, 'localhost')
  return promise
}

const getOrCreateCodePromise = (state: OAuthServerState): Promise<string> => {
  if (!state.codePromise) {
    const { promise, reject, resolve } = Promise.withResolvers<string>()
    state.codePromise = promise
    state.resolveCode = resolve
    state.rejectCode = reject
  }
  return state.codePromise
}

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
  rejectPendingCode(state, new Error('oauth server disposed'))
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
