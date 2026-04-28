export class OAuthExpectedQueuedCodeError extends Error {
  code = 'AUTH_PROCESS_OAUTH_EXPECTED_QUEUED_CODE'

  constructor() {
    super('expected oauth code to be queued')
    this.name = 'OAuthExpectedQueuedCodeError'
  }
}