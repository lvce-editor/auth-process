import type { IncomingMessage } from 'node:http'

export const getCodeFromRequest = (request: IncomingMessage): string | undefined => {
  if (!request.url) {
    return undefined
  }
  const url = new URL(request.url, 'http://localhost')
  const code = url.searchParams.get('code')
  return code || undefined
}
