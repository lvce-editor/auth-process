import { AUTH_PROCESS_OAUTH_SERVER_NOT_FOUND } from '../ErrorCodes/ErrorCodes.ts'

export class OAuthServerNotFoundError extends Error {
  code = AUTH_PROCESS_OAUTH_SERVER_NOT_FOUND

  constructor(id: string) {
    super(`oauth server ${id} not found`)
    this.name = 'OAuthServerNotFoundError'
  }
}
