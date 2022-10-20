import { DocumentNode } from 'graphql'
import { makeOperation } from '@urql/core'
import { authExchange } from '@urql/exchange-auth'
import { cacheExchange, CombinedError, createClient, dedupExchange, fetchExchange, Operation, OperationContext, OperationResult, TypedDocumentNode } from 'urql'
import { JWT_ACCESS_TOKEN_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY, LENS_API_URL } from '../constants'
import { setJwt, signOut } from './auth'
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

const getAuthState = () => {
    const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(JWT_REFRESH_TOKEN_KEY)
    const expirationTimeString = localStorage.getItem(JWT_EXPIRATION_TIME_KEY)
    if (!accessToken || !refreshToken || !expirationTimeString) return null
    const expirationTime = parseInt(expirationTimeString)

    return { accessToken, refreshToken, expirationTime }
}

const getAuth = async ({ authState, mutate }: { authState: any, mutate: MutateFunction }) => {
    if (!authState) return getAuthState()

    if (authState.refreshToken && authState.expirationTime && authState.expirationTime < Date.now()) {
        const refreshMutationResult = await mutate(RefreshQuery, { refreshToken: authState.refreshToken })
        const accessToken = refreshMutationResult.data?.authenticate.accessToken
        const refreshToken = refreshMutationResult.data?.authenticate.refreshToken

        if (!accessToken || !refreshToken) {
            await signOut()
            return null
        }

        await setJwt(accessToken, refreshToken)
        return getAuthState()
    }

    // authState is invalid, clean up
    await signOut()
    return null
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

const client = createClient({
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
console.debug('urql client instantiated')

export default client