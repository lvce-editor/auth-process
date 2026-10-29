import type { Server } from 'node:http'
import { afterEach, expect, jest, test } from '@jest/globals'
import { EventEmitter } from 'node:events'
import type { OAuthServerState } from '../src/parts/OAuthServerState/OAuthServerState.ts'
import { dispose } from '../src/parts/Dispose/Dispose.ts'
import { getCodeFromRequest } from '../src/parts/GetCodeFromRequest/GetCodeFromRequest.ts'
import { getOrCreateCodePromise } from '../src/parts/GetOrCreateCodePromise/GetOrCreateCodePromise.ts'
import { handleRequest } from '../src/parts/HandleRequest/HandleRequest.ts'
import { listen } from '../src/parts/ListenServer/ListenServer.ts'
import * as OAuthServer from '../src/parts/OAuthServer/OAuthServer.ts'
import { get, has, remove, set } from '../src/parts/State/State.ts'

const testIds: string[] = []

const createState = (): OAuthServerState => ({
  codePromise: undefined,
  codeQueue: [],
  errorHtml: 'error',
  portPromise: undefined,
  rejectCode: undefined,
  resolveCode: undefined,
  server: undefined,
  successHtml: 'success',
})

afterEach(async () => {
  jest.restoreAllMocks()
  while (testIds.length > 0) {
    await OAuthServer.dispose(testIds.pop()!)
  }
})

test('request parsing handles absent URL and empty code', () => {
  expect(getCodeFromRequest({ url: undefined } as any)).toBeUndefined()
  expect(getCodeFromRequest({ url: '/callback?code=' } as any)).toBeUndefined()
})

test('state reports membership and removes stored entries', () => {
  set('branch-test', createState())
  expect(has('branch-test')).toBe(true)
  expect(get('branch-test')).toMatchObject({ successHtml: 'success' })
  remove('branch-test')
  expect(has('branch-test')).toBe(false)
  expect(() => get('branch-test')).toThrow('oauth server branch-test not found')
})

test('getOrCreateCodePromise reuses a pending promise', () => {
  const state = createState()
  const first = getOrCreateCodePromise('promise-reuse', state)
  const second = getOrCreateCodePromise('promise-reuse', get('promise-reuse'))
  expect(second).toBe(first)
  remove('promise-reuse')
})

test('dispose removes a serverless state and reports close errors', async () => {
  await dispose('serverless-dispose')
  const id = 'failed-close'
  set(id, { ...createState(), server: { close: (callback: (error: Error) => void) => callback(new Error('close failed')) } as any })
  await expect(dispose(id)).rejects.toThrow('close failed')
  remove(id)
})

test('create reuses an in-flight port promise', async () => {
  const id = `reuse-${Date.now()}`
  testIds.push(id)
  const first = OAuthServer.create(id, 'first', 'error')
  const second = OAuthServer.create(id, 'second', 'error')
  expect(await second).toBe(await first)
})

test('getCode reports missing server and returns queued code', async () => {
  await expect(OAuthServer.getCode('missing-branch-test')).rejects.toMatchObject({ code: 'AUTH_PROCESS_OAUTH_SERVER_NOT_FOUND' })
  const id = `queued-${Date.now()}`
  testIds.push(id)
  const port = await OAuthServer.create(id, 'ok', 'error')
  await fetch(`http://localhost:${port}/callback?code=queued`)
  await expect(OAuthServer.getCode(id)).resolves.toBe('queued')
})

test('handleRequest does not respond after its state is removed', () => {
  const response = { end: jest.fn(), writeHead: jest.fn() }
  handleRequest('removed-state', { url: '/callback?code=x' } as any, response as any)
  expect(response.writeHead).not.toHaveBeenCalled()
  expect(response.end).not.toHaveBeenCalled()
})

test('listen rejects server errors and invalid addresses and removes listeners', async () => {
  const failed = new EventEmitter() as any
  failed.listen = jest.fn()
  failed.address = jest.fn()
  const failedPromise = listen(failed as Server)
  const failure = new Error('listen failed')
  failed.emit('error', failure)
  await expect(failedPromise).rejects.toBe(failure)
  expect(failed.listenerCount('listening')).toBe(0)

  const invalidAddress = new EventEmitter() as any
  invalidAddress.listen = jest.fn()
  invalidAddress.address = jest.fn(() => null)
  const invalidPromise = listen(invalidAddress as Server)
  invalidAddress.emit('listening')
  await expect(invalidPromise).rejects.toMatchObject({ code: 'AUTH_PROCESS_FAILED_TO_DETERMINE_OAUTH_SERVER_PORT' })
  expect(invalidAddress.listenerCount('error')).toBe(0)
})
