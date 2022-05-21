import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const API_URL = 'https://api.lens.dev/'

export const apolloClient = new ApolloClient({
    uri: API_URL,
    cache: new InMemoryCache(),
})

const queryGetProfileByHandle = `
query Profile($handle: Handle!) {
  profiles(request: { handles: [$handle], limit: 1 }) {
    items {
      id
      handle
      ownedBy
      stats {
        totalFollowers
        totalFollowing
      }
    }
  }
}
`

const queryGetFollowingByAddress = `
query Following($address: EthereumAddress!) {
  following(request: {address: $address}) {
    items {
      profile {
        id
        handle
        ownedBy
        stats {
          totalFollowers
          totalFollowing
        }
      }
    }
  }
}
`

export const getProfile = async (handle) => {
    const response = await apolloClient.query({
        query: gql(queryGetProfileByHandle),
        variables: {
            handle: handle
        }
    })
    return response?.data?.profiles?.items[0]
}

export const getFollowing = async (address) => {
    const response = await apolloClient.query({
        query: gql(queryGetFollowingByAddress),
        variables: {
            address
        }
    })
    return response?.data?.following?.items
}