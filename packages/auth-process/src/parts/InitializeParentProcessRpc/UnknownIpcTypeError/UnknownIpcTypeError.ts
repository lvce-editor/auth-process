export class UnknownIpcTypeError extends Error {
  code = 'AUTH_PROCESS_UNKNOWN_IPC_TYPE'

  constructor() {
    super('[auth-process] unknown ipc type')
    this.name = 'UnknownIpcTypeError'
  }
}
