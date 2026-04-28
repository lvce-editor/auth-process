export class OAuthServerDisposedError extends Error {
  code = 'AUTH_PROCESS_OAUTH_SERVER_DISPOSED'

  constructor() {
    super('oauth server disposed')
    this.name = 'OAuthServerDisposedError'
  }
}
