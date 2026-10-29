import { randomUUID } from 'node:crypto'
import * as OAuthServer from '../OAuthServer/OAuthServer.ts'

// Each connection owns its listeners, including when another client uses the same id.
export const createAuthClient = (): {
  readonly dispose: () => Promise<void>
  readonly execute: (method: string, ...params: any[]) => Promise<any>
} => {
  const prefix = randomUUID()
  const ids = new Map<string, string>()
  const creations = new Set<Promise<number>>()
  let closed = false
  return {
    async dispose(): Promise<void> {
      if (closed) {
        return
      }
      closed = true
      await Promise.allSettled(creations)
      await Promise.allSettled(Array.from(ids.values(), (id) => OAuthServer.dispose(id)))
      ids.clear()
    },
    async execute(method: string, id: string, ...params: any[]): Promise<any> {
      if (closed) {
        throw new Error('Auth connection is closed')
      }
      if (typeof id !== 'string') {
        throw new TypeError('Expected a string auth session id')
      }
      let internalId = ids.get(id)
      if (!internalId) {
        internalId = `${prefix}:${id}`
        ids.set(id, internalId)
      }
      switch (method) {
        case 'OAuthServer.create': {
          const creation = OAuthServer.create(internalId, params[0], params[1])
          creations.add(creation)
          try {
            return await creation
          } finally {
            creations.delete(creation)
          }
        }
        case 'OAuthServer.getCode':
          return OAuthServer.getCode(internalId)
        case 'OAuthServer.dispose':
          return OAuthServer.dispose(internalId)
        default:
          throw new Error(`Unknown auth method: ${method}`)
      }
    },
  }
}
