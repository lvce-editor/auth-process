import { test, expect } from '@jest/globals'
import * as EncodingType from '../src/parts/EncodingType/EncodingType.ts'

test('EncodingType.Utf8 has correct value', () => {
  expect(EncodingType.Utf8).toBe('utf8')
})
