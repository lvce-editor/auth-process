import { expect, jest, test } from '@jest/globals'
import { EventEmitter } from 'node:events'

const rpc = { ipc: {}, name: 'rpc' }
const create = jest.fn(async (_options?: unknown) => rpc)
const setRpc = jest.fn()
const setRegistryRpc = jest.fn()

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  ElectronMessagePortRpcClient: { create },
  ElectronUtilityProcessRpcClient: { create },
  NodeForkedProcessRpcClient: { create },
  NodeWorkerRpcClient: { create },
}))
jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  set: setRegistryRpc,
  SharedProcess: { set: setRpc },
}))

const { handleElectronMessagePort } = await import('../src/parts/HandleElectronMessagePort/HandleElectronMessagePort.ts')
const { initializeParentProcessRpc } = await import('../src/parts/InitializeParentProcessRpc/InitializeParentProcessRpc.ts')

test('message port RPC is created and registered only for a truthy id', async () => {
  const port = new EventEmitter()
  await handleElectronMessagePort(port, 4)
  expect(create).toHaveBeenCalledWith({ commandMap: {}, messagePort: port, requiresSocket: false })
  expect(setRegistryRpc).toHaveBeenCalledWith(4, rpc)

  setRegistryRpc.mockClear()
  await handleElectronMessagePort(new EventEmitter(), 0)
  expect(setRegistryRpc).not.toHaveBeenCalled()
})

test('parent RPC selects each supported IPC client', async () => {
  create.mockClear()
  setRpc.mockClear()
  for (const ipcType of ['node-worker', 'node-forked-process', 'electron-utility-process']) {
    await initializeParentProcessRpc([`--ipc-type=${ipcType}`])
  }
  expect(create).toHaveBeenCalledTimes(3)
  expect(setRpc).toHaveBeenCalledTimes(3)
  expect(setRpc).toHaveBeenCalledWith(rpc)
})
