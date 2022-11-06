import { DocumentNode } from 'graphql'
import { makeOperation } from '@urql/core'
import { authExchange } from '@urql/exchange-auth'
import { cacheExchange, Client, CombinedError, createClient, dedupExchange, fetchExchange, Operation, OperationContext, OperationResult, TypedDocumentNode } from 'urql'
import { JWT_ACCESS_TOKEN_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY, LENS_API_URL } from '../constants'
import { getExpirationTime, signOut } from './auth'
import { graphql } from './schema'

interface MutateFunction<Data = any, Variables extends object = {}> {
  (query: DocumentNode | TypedDocumentNode<Data, Variables> | string, variables?: Variables, context?: Partial<OperationContext>): Promise<OperationResult<Data>>
}

const RefreshQuery = graphql(`
  mutation Refresh($refreshToken: Jwt!) {
    refresh(request: { refreshToken: $refreshToken }) {
      accessToken
      refreshToken
    }
  }
`)

const getAuth = async ({ authState, mutate }: { authState: any, mutate: MutateFunction }) => {
  if (!authState) {
    const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(JWT_REFRESH_TOKEN_KEY)
    const expirationTimeString = localStorage.getItem(JWT_EXPIRATION_TIME_KEY)
    if (!accessToken || !refreshToken || !expirationTimeString) return null
    const expirationTime = parseInt(expirationTimeString)
    return { accessToken, refreshToken, expirationTime }
  }

  if (authState.refreshToken && authState.expirationTime && authState.expirationTime < Date.now()) {
    const refreshMutationResult = await mutate(RefreshQuery, { refreshToken: authState.refreshToken })
    const accessToken = refreshMutationResult.data?.refresh.accessToken
    const refreshToken = refreshMutationResult.data?.refresh.refreshToken
    const expirationTime = getExpirationTime(accessToken)
    if (accessToken && refreshToken && expirationTime) {
      // Update local storage
      localStorage.setItem(JWT_ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(JWT_EXPIRATION_TIME_KEY, expirationTime.toString())

      return { accessToken, refreshToken, expirationTime }
    }

    // authState is invalid, clean up
    signOut()
    return null
  }
}

const addAuthToOperation = ({ authState, operation }: { authState: any, operation: Operation }) => {
  if (!authState || !authState.accessToken) return operation

  const fetchOptions =
    typeof operation.context.fetchOptions === 'function'
      ? operation.context.fetchOptions()
      : operation.context.fetchOptions || {}

  // return operation with access token in headers
  return makeOperation(operation.kind, operation, {
    ...operation.context,
    fetchOptions: {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        'x-access-token': `Bearer ${authState.accessToken}`,
      },
    },
  })
}

const didAuthError = ({ error }: { error: CombinedError }) => {
  return error.graphQLErrors.some(e => e.extensions?.code === 'UNAUTHENTICATED')
}

const willAuthError = ({ authState }: { authState: any }) => {
  if (authState?.expirationTime && authState.expirationTime < Date.now()) return true
  return false
}

class ApiClientSingleton {
  private _client: Client

  private getClientInstance() {
    console.debug('urql client instantiated')
    return createClient({
      url: LENS_API_URL,
      requestPolicy: 'network-only',
      exchanges: [
        dedupExchange,
        cacheExchange,
        // authExchange is an asynchronous exchange
        // it must be placed in front of all fetchExchanges
        // but after all other synchronous exchanges
        authExchange({
          addAuthToOperation,
          didAuthError,
          willAuthError,
          getAuth,
        }),
        fetchExchange,
      ],
    })
  }

  constructor() {
    this._client = this.getClientInstance()
  }

  get client() {
    return this._client
  }

  public reset() {
    this._client = this.getClientInstance()
    return this._client
  }
}

const api = new ApiClientSingleton()
export default api