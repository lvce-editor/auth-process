import * as HandleElectronMessagePort from '../HandleElectronMessagePort/HandleElectronMessagePort.ts'
import * as OAuthServer from '../OAuthServer/OAuthServer.ts'

export const commandMap = {
  'HandleElectronMessagePort.handleElectronMessagePort': HandleElectronMessagePort.handleElectronMessagePort,
  'HandleMessagePort.handleMessagePort': HandleElectronMessagePort.handleElectronMessagePort,
  'OAuthServer.create': OAuthServer.create,
  'OAuthServer.dispose': OAuthServer.dispose,
  'OAuthServer.getCode': OAuthServer.getCode,
}
