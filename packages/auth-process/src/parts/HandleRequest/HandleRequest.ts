import type { IncomingMessage, ServerResponse } from 'node:http'
import { getCodeFromRequest } from '../GetCodeFromRequest/GetCodeFromRequest.ts'
import { resolveCode } from '../ResolveCode/ResolveCode.ts'
import { get, has } from '../State/State.ts'

export const handleRequest = (id: string, request: IncomingMessage, response: ServerResponse): void => {
  if (request.url === '/favicon.ico') {
    response.writeHead(404, {
      'Cache-Control': 'no-store',
    })
    response.end()
    return
  }
  if (!has(id)) {
    return
  }
  const state = get(id)
  let html = ''
  if (state) {
    const code = getCodeFromRequest(request)
    if (code) {
      resolveCode(state, code)
      html = state.successHtml
    } else {
      html = state.errorHtml
    }
  }
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/html; charset=utf-8',
  })
  response.end(html)
}
