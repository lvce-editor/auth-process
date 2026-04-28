import { expect, test } from '@jest/globals'
import { UnknownIpcTypeError } from '../src/parts/InitializeParentProcessRpc/UnknownIpcTypeError/UnknownIpcTypeError.ts'
import { FailedToDetermineOAuthServerPortError } from '../src/parts/OAuthServer/FailedToDetermineOAuthServerPortError/FailedToDetermineOAuthServerPortError.ts'
import { OAuthExpectedQueuedCodeError } from '../src/parts/OAuthServer/OAuthExpectedQueuedCodeError/OAuthExpectedQueuedCodeError.ts'
import { OAuthServerDisposedError } from '../src/parts/OAuthServer/OAuthServerDisposedError/OAuthServerDisposedError.ts'
import { OAuthServerNotFoundError } from '../src/parts/OAuthServer/OAuthServerNotFoundError/OAuthServerNotFoundError.ts'

test('OAuthServerNotFoundError exposes name message and code', () => {
  const error = new OAuthServerNotFoundError('test-id')

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('OAuthServerNotFoundError')
  expect(error.message).toBe('oauth server test-id not found')
  expect(error.code).toBe('AUTH_PROCESS_OAUTH_SERVER_NOT_FOUND')
})

test('OAuthExpectedQueuedCodeError exposes name message and code', () => {
  const error = new OAuthExpectedQueuedCodeError()

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('OAuthExpectedQueuedCodeError')
  expect(error.message).toBe('expected oauth code to be queued')
  expect(error.code).toBe('AUTH_PROCESS_OAUTH_EXPECTED_QUEUED_CODE')
})

test('FailedToDetermineOAuthServerPortError exposes name message and code', () => {
  const error = new FailedToDetermineOAuthServerPortError()

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('FailedToDetermineOAuthServerPortError')
  expect(error.message).toBe('failed to determine oauth server port')
  expect(error.code).toBe('AUTH_PROCESS_FAILED_TO_DETERMINE_OAUTH_SERVER_PORT')
})

test('OAuthServerDisposedError exposes name message and code', () => {
  const error = new OAuthServerDisposedError()

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('OAuthServerDisposedError')
  expect(error.message).toBe('oauth server disposed')
  expect(error.code).toBe('AUTH_PROCESS_OAUTH_SERVER_DISPOSED')
})

test('UnknownIpcTypeError exposes name message and code', () => {
  const error = new UnknownIpcTypeError()

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('UnknownIpcTypeError')
  expect(error.message).toBe('[auth-process] unknown ipc type')
  expect(error.code).toBe('AUTH_PROCESS_UNKNOWN_IPC_TYPE')
})
