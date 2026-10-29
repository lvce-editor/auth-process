import type { Server } from 'node:http'
import { expect, jest, test } from '@jest/globals'
import { EventEmitter } from 'node:events'
import { FailedToDetermineOAuthServerPortError } from '../src/parts/FailedToDetermineOAuthServerPortError/FailedToDetermineOAuthServerPortError.ts'
import { listen } from '../src/parts/ListenServer/ListenServer.ts'

const createServer = (
  address: ReturnType<Server['address']>,
  listenImplementation: Server['listen'] = () => ({}) as Server,
): Server => {
  return Object.assign(new EventEmitter(), {
    address: jest.fn(() => address),
    listen: jest.fn(listenImplementation),
  }) as unknown as Server
}

test('listen resolves with the port after the server starts listening', async () => {
  const server = createServer({ address: '127.0.0.1', family: 'IPv4', port: 1234 })
  const portPromise = listen(server)

  server.emit('listening')

  await expect(portPromise).resolves.toBe(1234)
  expect(server.listen).toHaveBeenCalledWith(0, 'localhost')
  expect(server.listenerCount('error')).toBe(0)
  expect(server.listenerCount('listening')).toBe(0)
})

test('listen rejects with the emitted error and removes the listening listener', async () => {
  const server = createServer(null)
  const error = new Error('server failed')
  const portPromise = listen(server)

  server.emit('error', error)

  await expect(portPromise).rejects.toBe(error)
  expect(server.listenerCount('error')).toBe(0)
  expect(server.listenerCount('listening')).toBe(0)
})

test.each([null, 'pipe'])('listen throws a domain error when the server address is %s', async (address) => {
  const server = createServer(address)
  const portPromise = listen(server)

  server.emit('listening')

  await expect(portPromise).rejects.toBeInstanceOf(FailedToDetermineOAuthServerPortError)
  expect(server.listenerCount('error')).toBe(0)
  expect(server.listenerCount('listening')).toBe(0)
})

test('listen propagates a synchronous server listen error and removes both listeners', async () => {
  const error = new Error('listen failed synchronously')
  const server = createServer(null, () => {
    throw error
  })

  await expect(listen(server)).rejects.toBe(error)
  expect(server.listenerCount('error')).toBe(0)
  expect(server.listenerCount('listening')).toBe(0)
})
