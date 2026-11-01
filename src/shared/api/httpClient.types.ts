export type ApiErrorKind = 'http' | 'network' | 'parse'

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface RequestOptions {
  params?: QueryParams
  signal?: AbortSignal
}

export interface HttpClient {
  get(path: string, options?: RequestOptions): Promise<unknown>
}
