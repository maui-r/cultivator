import jwtDecode, { JwtPayload } from 'jwt-decode'
import { CURRENT_PROFILE_ID_KEY, JWT_ACCESS_TOKEN_KEY, JWT_ADDRESS_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY } from '../constants'
import { useAppStore } from '../stores'

export const getExpirationTime = (accessToken: string | null | undefined) => {
  if (!accessToken) return null
  // Decode token to get expiration time
  const decodedAccessToken = jwtDecode<JwtPayload>(accessToken)
  const expirationTimeInSeconds = decodedAccessToken.exp
  if (!expirationTimeInSeconds) return null
  // Use milliseconds (like Date.now())
  return expirationTimeInSeconds * 1000
}

export const signOut = () => {
  console.debug('sign out')
  localStorage.removeItem(CURRENT_PROFILE_ID_KEY)
  localStorage.removeItem(JWT_ADDRESS_KEY)
  localStorage.removeItem(JWT_ACCESS_TOKEN_KEY)
  localStorage.removeItem(JWT_REFRESH_TOKEN_KEY)
  localStorage.removeItem(JWT_EXPIRATION_TIME_KEY)
  // WARNING: zustand middleware that modify set or get are not applied
  useAppStore.setState({ currentAddress: null, currentProfileId: null })
}