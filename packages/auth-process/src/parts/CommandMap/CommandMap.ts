import * as OAuthServer from '../OAuthServer/OAuthServer.ts'

export const commandMap = {
  'OAuthServer.create': OAuthServer.create,
  'OAuthServer.dispose': OAuthServer.dispose,
  'OAuthServer.getCode': OAuthServer.getCode,
}
