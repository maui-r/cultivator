export const LENS_API_URL = process.env.REACT_APP_LENS_API_URL ?? 'https://api.lens.dev/'
export const APP_CHAIN_ID = process.env.REACT_APP_CHAIN_ID ? parseInt(process.env.REACT_APP_CHAIN_ID) : 137
// local storage keys
export const JWT_ADDRESS_KEY = 'jwtAddress' // Address of the authenticated wallet
export const JWT_ACCESS_TOKEN_KEY = 'jwtAccessToken'
export const JWT_REFRESH_TOKEN_KEY = 'jwtRefreshToken'
export const JWT_EXPIRATION_TIME_KEY = 'jwtExpirationTime'