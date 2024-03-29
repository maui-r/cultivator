export const LENS_API_URL = process.env.REACT_APP_LENS_API_URL ?? 'https://api.lens.dev/'
export const SUBGRAPH_API_URL = process.env.REACT_APP_SUBGRAPH_API_URL ?? 'https://api.thegraph.com/subgraphs/name/maui-r/lens-protocol-account-profile'
export const APP_CHAIN_ID = process.env.REACT_APP_CHAIN_ID ? parseInt(process.env.REACT_APP_CHAIN_ID) : 137
export const APP_CHAIN_NAME = process.env.REACT_APP_CHAIN_NAME ?? 'Polygon Mainnet'
export const IS_MAINNET = APP_CHAIN_ID === 137

export const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY ?? ''

export const REQUEST_DELAY = 500
export const REQUEST_LIMIT = 50

// local storage keys
export const CURRENT_PROFILE_ID_KEY = 'profileId'
export const JWT_ADDRESS_KEY = 'jwtAddress' // Address of the authenticated wallet
export const JWT_ACCESS_TOKEN_KEY = 'jwtAccessToken'
export const JWT_REFRESH_TOKEN_KEY = 'jwtRefreshToken'
export const JWT_EXPIRATION_TIME_KEY = 'jwtExpirationTime'