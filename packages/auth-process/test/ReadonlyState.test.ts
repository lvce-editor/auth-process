import { afterEach, expect, test } from '@jest/globals'
import type { OAuthServerState } from '../src/parts/OAuthServerState/OAuthServerState.ts'
import { getOrCreateCodePromise } from '../src/parts/GetOrCreateCodePromise/GetOrCreateCodePromise.ts'
import { resolveCode } from '../src/parts/ResolveCode/ResolveCode.ts'
import { get, remove, set } from '../src/parts/State/State.ts'

const createState = (): OAuthServerState => {
  return {
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

afterEach(() => {
  remove('test-state')
})

test('getOrCreateCodePromise replaces stored state object', () => {
  const state = createState()
  set('test-state', state)

  const promise = getOrCreateCodePromise('test-state', state)
  const nextState = get('test-state')

  expect(state.codePromise).toBeUndefined()
  expect(state.resolveCode).toBeUndefined()
  expect(state.rejectCode).toBeUndefined()
  expect(nextState).not.toBe(state)
  expect(nextState.codePromise).toBe(promise)
  expect(typeof nextState.resolveCode).toBe('function')
  expect(typeof nextState.rejectCode).toBe('function')
})

test('resolveCode replaces stored state object when queueing code', () => {
  const state = createState()
  set('test-state', state)

  resolveCode('test-state', state, 'queued-code')
  const nextState = get('test-state')

  expect(state.codeQueue).toEqual([])
  expect(nextState).not.toBe(state)
  expect(nextState.codeQueue).toEqual(['queued-code'])
})
