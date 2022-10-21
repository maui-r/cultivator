import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { LENS_API_URL } from '../constants'

export const apolloClient = new ApolloClient({
  uri: LENS_API_URL,
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

export const getProfile = async (handle: string) => {
  const response = await apolloClient.query({
    query: gql(queryGetProfileByHandle),
    variables: {
      handle: handle
    }
  })
  return response?.data?.profiles?.items[0]
}

export const getRelations = async ({ id, ownedBy }: { id: string, ownedBy: string }) => {
  const response = await apolloClient.query({
    query: gql(queryGetRelations),
    variables: { id: id, address: ownedBy }
  })
  return {
    following: response?.data?.following?.items || [],
    followers: response?.data?.followers?.items || [],
  }
}