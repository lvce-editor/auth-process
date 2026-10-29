import type { Server } from 'node:http'
import { FailedToDetermineOAuthServerPortError } from '../FailedToDetermineOAuthServerPortError/FailedToDetermineOAuthServerPortError.ts'

export const listen = async (server: Server): Promise<number> => {
  let listenError: Error | undefined
  let port: number | undefined
  const { promise, resolve } = Promise.withResolvers<boolean>()

  const onError = (error: Error): void => {
    server.off('listening', onListening)
    listenError = error
    resolve(false)
  }

  const onListening = (): void => {
    server.off('error', onError)
    const address = server.address()
    if (!address || typeof address === 'string') {
      listenError = new FailedToDetermineOAuthServerPortError()
      resolve(false)
      return
    }
    const { port: listenPort } = address
    port = listenPort
    resolve(true)
  }

  server.once('error', onError)
  server.once('listening', onListening)
  try {
    server.listen(0, 'localhost')
  } catch (error) {
    server.off('error', onError)
    server.off('listening', onListening)
    throw error
  }
  const success = await promise
  if (!success) {
    throw listenError ?? new FailedToDetermineOAuthServerPortError()
  }
  if (port === undefined) {
    throw new FailedToDetermineOAuthServerPortError()
  }
  return port
}
