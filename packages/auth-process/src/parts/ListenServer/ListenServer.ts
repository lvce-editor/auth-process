import type { Server } from 'node:http'
import { FailedToDetermineOAuthServerPortError } from '../FailedToDetermineOAuthServerPortError/FailedToDetermineOAuthServerPortError.ts'

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
      reject(new FailedToDetermineOAuthServerPortError())
      return
    }
    resolve(address.port)
  }

  server.once('error', onError)
  server.once('listening', onListening)
  server.listen(0, 'localhost')
  return promise
}
