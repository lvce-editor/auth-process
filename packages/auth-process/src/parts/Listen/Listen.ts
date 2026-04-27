import { initializeParentProcessRpc } from '../InitializeParentProcessRpc/InitializeParentProcessRpc.ts'

export const listen = async (argv: readonly string[]): Promise<void> => {
  await initializeParentProcessRpc(argv)
}
