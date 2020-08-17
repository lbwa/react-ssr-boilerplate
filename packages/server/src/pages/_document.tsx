import React, { Component, useContext } from 'react'
import { DEFAULT_PAGE_TITLE } from '../constants'
import { DocumentContext, DocumentProps } from '../types'

const DocumentContext = React.createContext<DocumentProps>(null as any)

if (process.env.NODE_ENV !== 'production') {
  DocumentContext.displayName = 'DocumentContext'
}

export default class Document<P = {}> extends Component<P> {
  static getInitialProps(context: DocumentContext) {
    const { html } = context.renderPage()
    return { html }
  }

  static renderDocument<P>(
    DocumentComponent: new () => Document<P>,
    props: DocumentProps & P
  ) {
    return (
      <DocumentContext.Provider value={props}>
        <DocumentComponent {...props} />
      </DocumentContext.Provider>
    )
  }

  render() {
    return (
      <html>
        <Head title={DEFAULT_PAGE_TITLE} />
        <body>
          <Main />
        </body>
      </html>
    )
  }
}

const Head: React.FC<{ title: string }> = ({ title }) => {
  return (
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <title>{title}</title>
    </head>
  )
}

const Main: React.FC = () => {
  const { html } = useContext(DocumentContext)
  return <div id="root" dangerouslySetInnerHTML={{ __html: html }}></div>
}
