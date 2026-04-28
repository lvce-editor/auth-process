import { test, expect } from '@jest/globals'
import { UnknownIpcTypeError } from '../src/parts/InitializeParentProcessRpc/UnknownIpcTypeError/UnknownIpcTypeError.ts'
import * as Listen from '../src/parts/Listen/Listen.ts'

test('listen is a function', () => {
  expect(typeof Listen.listen).toBe('function')
})

test('listen throws error for invalid argv', async () => {
  const promise = Listen.listen([])

  await expect(promise).rejects.toMatchObject({
    code: 'AUTH_PROCESS_UNKNOWN_IPC_TYPE',
    message: '[auth-process] unknown ipc type',
  })
  await expect(promise).rejects.toBeInstanceOf(UnknownIpcTypeError)
})
