import type { Server } from 'node:http'

export const listen = (server: Server): Promise<number> => {
  const { promise, reject, resolve } = Promise.withResolvers<number>()

  const onError = (error: Error): void => {
    server.off('listening', onListening)
    reject(error)
  }

  const onListening = (): void => {
    server.off('error', onError)
    const address = server.address()
    if (!address || typeof address === 'string') {
      reject(new Error('failed to determine oauth server port'))
      return
    }
    resolve(address.port)
  }

  server.once('error', onError)
  server.once('listening', onListening)
  server.listen(0, 'localhost')
  return promise
}