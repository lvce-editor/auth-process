import { ElectronMessagePortRpcClient, type Rpc } from '@lvce-editor/rpc'
import { set, SharedProcess } from '@lvce-editor/rpc-registry'
import * as Assert from '../Assert/Assert.ts'
import { createAuthClient } from '../AuthClient/AuthClient.ts'

export const handleElectronMessagePort = async (messagePort: any, rpcId?: number, connectionId?: string): Promise<void> => {
  Assert.object(messagePort)
  // The first transferred port is the parent shared-process channel, not an auth client.
  // Keep global lifecycle/transfer commands available on that channel.
  if (rpcId && !connectionId) {
    const rpc = await ElectronMessagePortRpcClient.create({ commandMap: {}, messagePort, requiresSocket: false })
    set(rpcId, rpc)
    return
  }
  const client = createAuthClient()
  let closed = false
  const handleClose = (): void => {
    if (closed) {
      return
    }
    closed = true
    messagePort.off('close', handleClose)
    void client.dispose().finally(() => {
      if (connectionId) {
        void SharedProcess.invoke('HandleMessagePortForAuthProcess.handleAuthProcessIpcClosed', connectionId).catch(console.error)
      }
    })
  }
  messagePort.on('close', handleClose)
  try {
    const rpc = await ElectronMessagePortRpcClient.create({
      commandMap: {},
      messagePort,
      requiresSocket: false,
    })
    // RPC supports connection-local dispatch; the global command map belongs to the parent.
    const { ipc } = rpc as Rpc & { readonly ipc: { execute: typeof client.execute } }
    ipc.execute = client.execute
    if (closed) {
      await rpc.dispose()
    } else if (rpcId) {
      set(rpcId, rpc)
    }
  } catch (error) {
    messagePort.close()
    handleClose()
    throw error
  }
}
