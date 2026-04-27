import { test, expect } from '@jest/globals'
import * as Trash from '../src/parts/Trash/Trash.ts'

test('trash is a function', () => {
  expect(typeof Trash.trash).toBe('function')
})

test('trash throws error for invalid path', async () => {
  await expect(Trash.trash('')).rejects.toThrow()
})
