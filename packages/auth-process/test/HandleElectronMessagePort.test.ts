import { beforeEach, test, expect, jest } from '@jest/globals'
import { EventEmitter } from 'node:events'

const create = jest.fn<(...args: any[]) => Promise<any>>()
const invoke = jest.fn<(...args: any[]) => Promise<void>>()
const set = jest.fn()
jest.unstable_mockModule('@lvce-editor/rpc', () => ({ ElectronMessagePortRpcClient: { create } }))
jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({ set, SharedProcess: { invoke } }))
const { handleElectronMessagePort } = await import('../src/parts/HandleElectronMessagePort/HandleElectronMessagePort.ts')

class Port extends EventEmitter {
  close(): void {
    this.emit('close')
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  invoke.mockResolvedValue(undefined)
})

test('rejects invalid ports', async () => {
  await expect(handleElectronMessagePort(null, 0)).rejects.toThrow()
})

test('close notifies exactly once and removes its listener', async () => {
  const rpc = { dispose: jest.fn(async () => {}), ipc: {} }
  create.mockResolvedValueOnce(rpc)
  const port = new Port()
  const notified = Promise.withResolvers<void>()
  invoke.mockImplementationOnce(async () => {
    notified.resolve()
  })
  await handleElectronMessagePort(port, 42, 'connection')
  expect(set).toHaveBeenCalledWith(42, rpc)
  port.close()
  port.close()
  await notified.promise
  expect(invoke).toHaveBeenCalledTimes(1)
  expect(invoke).toHaveBeenCalledWith('HandleMessagePortForAuthProcess.handleAuthProcessIpcClosed', 'connection')
  expect(port.listenerCount('close')).toBe(0)
})

test('initialization failure closes the port and releases its reservation', async () => {
  create.mockRejectedValueOnce(new Error('init failed'))
  const port = new Port()
  const notified = Promise.withResolvers<void>()
  invoke.mockImplementationOnce(async () => {
    notified.resolve()
  })
  await expect(handleElectronMessagePort(port, 0, 'failed')).rejects.toThrow('init failed')
  await notified.promise
  expect(invoke).toHaveBeenCalledTimes(1)
})

test('close during initialization disposes the arriving RPC without registering it', async () => {
  const pending = Promise.withResolvers<any>()
  create.mockReturnValueOnce(pending.promise)
  const port = new Port()
  const handler = handleElectronMessagePort(port, 0)
  port.close()
  const rpc = { dispose: jest.fn(async () => {}), ipc: {} }
  pending.resolve(rpc)
  await handler
  expect(rpc.dispose).toHaveBeenCalledTimes(1)
  expect(set).not.toHaveBeenCalled()
  expect(invoke).not.toHaveBeenCalled()
})

test('the shared-process parent channel keeps lifecycle and transfer command dispatch', async () => {
  const rpc = { ipc: {} }
  create.mockResolvedValueOnce(rpc)
  const port = new Port()
  await handleElectronMessagePort(port, 42)
  expect(set).toHaveBeenCalledWith(42, rpc)
  expect(rpc.ipc).not.toHaveProperty('execute')
  expect(port.listenerCount('close')).toBe(0)
})
