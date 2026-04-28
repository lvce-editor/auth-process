import { afterEach, expect, test } from '@jest/globals'
import * as OAuthServer from '../src/parts/OAuthServer/OAuthServer.ts'
import { OAuthServerDisposedError } from '../src/parts/OAuthServerDisposedError/OAuthServerDisposedError.ts'

const disposableIds: string[] = []

let idCounter = 0

const createTestId = (): string => {
  idCounter += 1
  const id = `oauth-server-${idCounter}`
  disposableIds.push(id)
  return id
}

const request = async (port: number, path: string): Promise<string> => {
  const response = await fetch(`http://localhost:${port}${path}`)
  return response.text()
}

afterEach(async () => {
  while (disposableIds.length > 0) {
    const id = disposableIds.pop()
    if (!id) {
      throw new Error('expected disposable oauth server id')
    }
    await OAuthServer.dispose(id)
  }
})

test('create and getCode resolve oauth code from request', async () => {
  const id = createTestId()
  const port = await OAuthServer.create(id, '<p>success</p>', '<p>error</p>')
  const codePromise = OAuthServer.getCode(id)

  const html = await request(port, '/callback?code=abc123')
  const code = await codePromise

  expect(html).toBe('<p>success</p>')
  expect(code).toBe('abc123')
})

test('getCode returns queued oauth code from earlier request', async () => {
  const id = createTestId()
  const port = await OAuthServer.create(id, '<p>success</p>', '<p>error</p>')

  const html = await request(port, '/callback?code=queued-code')
  const code = await OAuthServer.getCode(id)

  expect(html).toBe('<p>success</p>')
  expect(code).toBe('queued-code')
})

test('request without oauth code returns error html', async () => {
  const id = createTestId()
  const port = await OAuthServer.create(id, '<p>success</p>', '<p>error</p>')

  const html = await request(port, '/callback')

  expect(html).toBe('<p>error</p>')
})

test('dispose rejects pending getCode promise', async () => {
  const id = createTestId()
  await OAuthServer.create(id, '<p>success</p>', '<p>error</p>')

  const codePromise = OAuthServer.getCode(id)
  await OAuthServer.dispose(id)
  disposableIds.pop()

  await expect(codePromise).rejects.toMatchObject({
    code: 'AUTH_PROCESS_OAUTH_SERVER_DISPOSED',
    message: 'oauth server disposed',
  })
  await expect(codePromise).rejects.toBeInstanceOf(OAuthServerDisposedError)
})
