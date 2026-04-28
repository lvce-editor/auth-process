export class FailedToDetermineOAuthServerPortError extends Error {
  code = 'AUTH_PROCESS_FAILED_TO_DETERMINE_OAUTH_SERVER_PORT'

  constructor() {
    super('failed to determine oauth server port')
    this.name = 'FailedToDetermineOAuthServerPortError'
  }
}
