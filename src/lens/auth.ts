import jwtDecode, { JwtPayload } from 'jwt-decode'
import { JWT_ACCESS_TOKEN_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY } from '../constants'
import { useAppStore } from '../stores'

interface AuthState {
  accessToken: string
  refreshToken: string
  expirationTime: number
}

export const getAuthState = (): AuthState | null => {
  const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(JWT_REFRESH_TOKEN_KEY)
  const expirationTimeString = localStorage.getItem(JWT_EXPIRATION_TIME_KEY)
  if (!accessToken || !refreshToken || !expirationTimeString) return null
  const expirationTime = parseInt(expirationTimeString)

  return { accessToken, refreshToken, expirationTime }
}

export const setAuthState = async (accessToken: string, refreshToken: string) => {
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
    localStorage.setItem(JWT_ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(JWT_EXPIRATION_TIME_KEY, expirationTimeInMilliseconds.toString())
    // WARNING: zustand middleware that modify set or get are not applied
    useAppStore.setState({ hasSignedIn: true })
  } catch { }
}

export const signOut = async () => {
  try {
    localStorage.removeItem(JWT_ACCESS_TOKEN_KEY)
    localStorage.removeItem(JWT_REFRESH_TOKEN_KEY)
    localStorage.removeItem(JWT_EXPIRATION_TIME_KEY)
    // WARNING: zustand middleware that modify set or get are not applied
    useAppStore.setState({ hasSignedIn: false })
  } catch { }
}