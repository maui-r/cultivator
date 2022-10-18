import { signMessage } from '@wagmi/core'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { CHAIN_ID_KEY, JWT_ACCESS_TOKEN_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY, POLYGON_CHAIN_ID, WALLET_ADDRESS_KEY } from '../constants'
import { useAppStore } from '../stores'
import client from './client'
import { graphql } from './schema'

const ChallengeQuery = graphql(`
  query Challenge($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }
`)

const AuthenticateMutation = graphql(`
  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
    authenticate(request: {
      address: $address,
      signature: $signature
    }) {
      accessToken
      refreshToken
    }
  }
`)

export const setJwt = async (accessToken: string, refreshToken: string) => {
  // Decode token to get expiration time
  const decodedAccessToken = jwtDecode<JwtPayload>(accessToken)
  const expirationTime = decodedAccessToken.exp

  if (!expirationTime) {
    await signOut()
    return
  }

  // Update local storage and state
  localStorage.setItem(JWT_ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(JWT_EXPIRATION_TIME_KEY, expirationTime.toString())
  // WARNING: zustand middleware that modify set or get are not applied
  useAppStore.setState({ hasSignedIn: true })
}

export const signIn = async () => {
  const address = sessionStorage.getItem(WALLET_ADDRESS_KEY)
  if (!address) return
  const chainId = sessionStorage.getItem(CHAIN_ID_KEY)
  if (!chainId || parseInt(chainId) !== POLYGON_CHAIN_ID) return

  // Get challenge
  const challengeQueryResult = await client
    .query(ChallengeQuery, { address })
    .toPromise()
  const challenge = challengeQueryResult.data?.challenge.text
  if (!challenge) return

  // Sign challenge
  const signature = await signMessage({ message: challenge })

  // Get JWT tokens
  const authMutationResult = await client
    .mutation(AuthenticateMutation, { address, signature })
    .toPromise()
  const accessToken = authMutationResult.data?.authenticate.accessToken
  const refreshToken = authMutationResult.data?.authenticate.refreshToken

  if (!accessToken || !refreshToken) {
    await signOut()
    return
  }

  await setJwt(accessToken, refreshToken)
}

export const signOut = async () => {
  // TODO: call sign out API endpoint if there is an access token
  localStorage.removeItem(JWT_ACCESS_TOKEN_KEY)
  localStorage.removeItem(JWT_REFRESH_TOKEN_KEY)
  localStorage.removeItem(JWT_EXPIRATION_TIME_KEY)
  // WARNING: zustand middleware that modify set or get are not applied
  useAppStore.setState({ hasSignedIn: false })
}