import { ComponentType } from 'react'
import { ServerResponse } from 'http'

interface BasicContext {
  res?: ServerResponse
  [key: string]: any
}

export type UniversalComponentType<
  Context extends BasicContext,
  ReturnProps = {},
  Props = {}
> = ComponentType<Props> & {
  getInitialProps?(context: Context): ReturnProps | Promise<ReturnProps>
}

export type DocumentContext = {
  renderPage: () => RenderResult
}

export type DocumentInitialProps = RenderResult

export type DocumentProps = DocumentInitialProps & {
  html: string
  __UNIVERSAL_STATE__: Record<string, any>
}

export interface RenderResult {
  html: string
}

export type DocumentType = UniversalComponentType<
  DocumentContext,
  DocumentInitialProps,
  DocumentProps
> & {
  renderDocument(
    Document: DocumentType,
    props: DocumentProps
  ): React.ReactElement
}

export type AppType<P = {}> = UniversalComponentType<P>

export interface RenderOptions {
  Document: DocumentType
  App: AppType
}
