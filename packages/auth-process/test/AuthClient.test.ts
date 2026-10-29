import { expect, test } from '@jest/globals'
import { createAuthClient } from '../src/parts/AuthClient/AuthClient.ts'

const create = (client: ReturnType<typeof createAuthClient>, id = 'same-id'): Promise<number> =>
  client.execute('OAuthServer.create', id, 'success', 'failure')

test('disconnect closes only this client’s servers and rejects its pending callback', async () => {
  const first = createAuthClient()
  const second = createAuthClient()
  const [firstPort, secondPort] = await Promise.all([create(first), create(second)])
  expect(firstPort).not.toBe(secondPort)
  const callback = first.execute('OAuthServer.getCode', 'same-id')
  await Promise.all([expect(callback).rejects.toThrow('oauth server disposed'), first.dispose()])
  await first.dispose()
  await expect(fetch(`http://localhost:${firstPort}/callback?code=old`)).rejects.toThrow()
  const response = await fetch(`http://localhost:${secondPort}/callback?code=working`)
  expect(response.status).toBe(200)
  expect(await second.execute('OAuthServer.getCode', 'same-id')).toBe('working')
  await second.dispose()
})

test('disconnect during creation waits for the listener and closes it', async () => {
  const client = createAuthClient()
  const pending = create(client)
  const disposal = client.dispose()
  const port = await pending
  await disposal
  await expect(fetch(`http://localhost:${port}/callback?code=old`)).rejects.toThrow()
  await expect(create(client)).rejects.toThrow('Auth connection is closed')
})

test('explicit cleanup and disconnected cleanup are safe together', async () => {
  const client = createAuthClient()
  await create(client)
  await expect(client.execute('OAuthServer.dispose', 'same-id')).resolves.toBeUndefined()
  await expect(client.dispose()).resolves.toBeUndefined()
})

test('rejects unsupported commands and invalid session ids', async () => {
  const client = createAuthClient()
  await expect(client.execute('AuthProcess.dispose', 'id')).rejects.toThrow('Unknown auth method')
  await expect(client.execute('OAuthServer.create', 1)).rejects.toThrow('Expected a string')
  await client.dispose()
})
