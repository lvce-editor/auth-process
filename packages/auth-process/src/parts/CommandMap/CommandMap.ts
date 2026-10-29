import { exit } from '../Exit/Exit.ts'
import * as HandleElectronMessagePort from '../HandleElectronMessagePort/HandleElectronMessagePort.ts'
import * as OAuthServer from '../OAuthServer/OAuthServer.ts'

export const commandMap = {
  'AuthProcess.dispose': exit,
  'HandleElectronMessagePort.handleElectronMessagePort': HandleElectronMessagePort.handleElectronMessagePort,
  'HandleMessagePort.handleMessagePort': HandleElectronMessagePort.handleElectronMessagePort,
  'OAuthServer.create': OAuthServer.create,
  'OAuthServer.dispose': OAuthServer.dispose,
  'OAuthServer.getCode': OAuthServer.getCode,
}
