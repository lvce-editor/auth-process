import type { IncomingMessage, ServerResponse } from 'node:http'
import { getCodeFromRequest } from '../GetCodeFromRequest/GetCodeFromRequest.ts'
import { resolveCode } from '../ResolveCode/ResolveCode.ts'
import { states } from '../State/State.ts'

export const handleRequest = (id: string, request: IncomingMessage, response: ServerResponse): void => {
  const state = states[id]
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