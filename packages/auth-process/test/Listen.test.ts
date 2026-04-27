import { test, expect } from '@jest/globals'
import * as Listen from '../src/parts/Listen/Listen.ts'

test('listen is a function', () => {
  expect(typeof Listen.listen).toBe('function')
})

test('listen throws error for invalid argv', async () => {
  await expect(Listen.listen([])).rejects.toThrow('[auth-process] unknown ipc type')
})
