export const exit = (): never => {
  // This command terminates a dedicated child process after its last client disconnects.
  // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
  process.exit(0)
}
