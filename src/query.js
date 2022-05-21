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

const queryGetRelations = `
query Relations($id: ProfileId!, $address: EthereumAddress!) {
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
  followers(request: {profileId: $id}) {
    items {
      wallet {
        address
        defaultProfile {
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

export const getRelations = async ({ id, ownedBy }) => {
    const response = await apolloClient.query({
        query: gql(queryGetRelations),
        variables: { id: id, address: ownedBy }
    })
    return {
        following: response?.data?.following?.items || [],
        followers: response?.data?.followers?.items || [],
    }
}