import jwtDecode, { JwtPayload } from 'jwt-decode'
import { JWT_ACCESS_TOKEN_KEY, JWT_ADDRESS_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY } from '../constants'
import { useAppStore } from '../stores'
import client from './client'
import { graphql } from './schema'

interface AuthState {
  address: string
  accessToken: string
  refreshToken: string
  expirationTime: number
}

export const getAuthState = (): AuthState | null => {
  const address = localStorage.getItem(JWT_ADDRESS_KEY)
  const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(JWT_REFRESH_TOKEN_KEY)
  const expirationTimeString = localStorage.getItem(JWT_EXPIRATION_TIME_KEY)
  if (!address || !accessToken || !refreshToken || !expirationTimeString) return null
  const expirationTime = parseInt(expirationTimeString)

  return { address, accessToken, refreshToken, expirationTime }
}

export const setAuthState = async ({ address, accessToken, refreshToken }: { address: string, accessToken: string, refreshToken: string }) => {
  try {
    // Decode token to get expiration time
    const decodedAccessToken = jwtDecode<JwtPayload>(accessToken)
    const expirationTime = decodedAccessToken.exp

    if (!expirationTime) {
      await signOut()
      return
    }

    // Use milliseconds (like Date.now())
    const expirationTimeInMilliseconds = expirationTime * 1000
    // Update local storage and zustand
    localStorage.setItem(JWT_ADDRESS_KEY, address)
    localStorage.setItem(JWT_ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(JWT_EXPIRATION_TIME_KEY, expirationTimeInMilliseconds.toString())
    // WARNING: zustand middleware that modify set or get are not applied
    useAppStore.setState({ hasSignedIn: true })
    await updateCurrentProfileState(address)
  } catch (error) { console.log(error) }
}

export const signOut = async () => {
  try {
    localStorage.removeItem(JWT_ADDRESS_KEY)
    localStorage.removeItem(JWT_ACCESS_TOKEN_KEY)
    localStorage.removeItem(JWT_REFRESH_TOKEN_KEY)
    localStorage.removeItem(JWT_EXPIRATION_TIME_KEY)
    // WARNING: zustand middleware that modify set or get are not applied
    useAppStore.setState({ hasSignedIn: false })
    await updateCurrentProfileState(null)
  } catch (error) { console.log(error) }
}

const DefaultProfileQuery = graphql(`
  query DefaultProfile($ethereumAddress: EthereumAddress!) {
    defaultProfile(request: { ethereumAddress: $ethereumAddress}) {
      id
      handle
    }
  }
`)

const getDefaultProfile = async (ethereumAddress: string) => {
  const result = await client
    .query(DefaultProfileQuery, { ethereumAddress })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.defaultProfile
}

const updateCurrentProfileState = async (address: string | null) => {
  if (!address || !useAppStore.getState().hasSignedIn) {
    useAppStore.setState({ currentProfile: null })
    return
  }

  try {
    const currentProfile = await getDefaultProfile(address)
    useAppStore.setState({ currentProfile })
  } catch {
    useAppStore.setState({ currentProfile: null })
  }
}