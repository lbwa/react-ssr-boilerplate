import React from 'react'
import { renderToString } from 'react-dom/server'
import { IncomingMessage, ServerResponse } from 'http'
import { RenderOptions, DocumentType, RenderResult } from './types'

export async function renderToHTML(
  //@ts-ignore
  req: IncomingMessage,
  // @ts-ignore
  res: ServerResponse,
  renderOptions: RenderOptions
): Promise<string> {
  const { Document, App } = renderOptions
  const renderPage = () => {
    const html = renderToString(<App />)
    return { html }
  }
  const documentContext = { renderPage }
  if (!Document.getInitialProps) {
    throw new Error(`<Document> should has a getInitialProps method`)
  }
  const docProps = await Document.getInitialProps(documentContext)
  const entireDoc = renderDocument(Document, { ...renderOptions, docProps })

  return entireDoc
}

function renderDocument(
  Document: DocumentType,
  {
    docProps
  }: RenderOptions & {
    docProps: RenderResult
  }
) {
  return (
    '<!DOCTYPE html>' +
    renderToString(
      Document.renderDocument(Document, {
        __UNIVERSAL_STATE__: {
          id: 123
        },
        ...docProps
      })
    )
  )
}
