import { IncomingMessage, ServerResponse } from 'http'
import chalk from 'chalk'
import { renderToHTML } from './render'

enum ResponseMime {
  JSON = 'application/json',
  HTML = 'text/html;charset=utf-8'
}

enum StatusCode {
  INTERNAL_ERROR = 500
}

function asyncTryCatch<V, R extends Error>(promise: Promise<V>) {
  return promise
    .then<[V, null]>((answer) => [answer, null])
    .catch<[null, R]>((reason) => [null, reason])
}

export default class Server {
  async render(req: IncomingMessage, res: ServerResponse) {
    const [html, exception] = await asyncTryCatch(this.renderToHTML(req, res))
    if (exception) {
      console.error(chalk.red(exception.message))
      res.statusCode = StatusCode.INTERNAL_ERROR
      res.end(`internal error found`)
    }
    if (!html) {
      return
    }
    return this.sendHTML(req, res, html)
  }

  private async renderToHTML(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string> {
    return renderToHTML(req, res, {
      Document: require('./pages/_document').default,
      App: require('./pages/_app').default
    })
  }

  private async sendHTML(
    req: IncomingMessage,
    res: ServerResponse,
    html: string
  ) {
    return sendPayload(req, res, html, 'html')
  }
}

function sendPayload<P>(
  req: IncomingMessage,
  res: ServerResponse,
  payload: P,
  type: 'html' | 'json'
) {
  if (!res.getHeader('Content-Type')) {
    res.setHeader(
      'Content-Type',
      type === 'json' ? ResponseMime.JSON : ResponseMime.HTML
    )
  }

  // HEAD method would never has a response body
  res.end(req.method === 'HEAD' ? null : payload)
}
