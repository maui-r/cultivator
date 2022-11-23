import { createClient } from 'urql'
import { REQUEST_DELAY, SUBGRAPH_API_URL } from '../constants'
import { sleep } from '../helpers'

const client = createClient({
  url: SUBGRAPH_API_URL,
})
console.debug('the graph client instantiated')

const FollowedByAddressQuery = `
  query FollowedByAddress($ethereumAddress: Bytes!, $lastId: String) {
    account(id: $ethereumAddress) {
      following(first: 1000, where: { id_gt: $lastId}) {
        id
        profile {
          id
        }
      }
    }
  }
`

export const getAllFollowing = async (ethereumAddress: string): Promise<string[]> => {
  const following = []

  let result
  let lastId = ''
  do {
    await sleep(REQUEST_DELAY)
    result = await client
      .query(FollowedByAddressQuery, { ethereumAddress, lastId })
      .toPromise()

    if (!result.data) {
      throw new Error('No result data')
    }

    if (!result.data.account?.following) {
      // Address is not following anyone
      return []
    }

    for (let followRelation of result.data.account.following) {
      following.push(followRelation.profile.id)
      lastId = followRelation.id
    }
    console.debug('.. fetched', result.data.account.following.length, 'following ids')
  } while (result.data.account.following.length === 1000)

  return following
}

const FollowersOfProfileIdSortedQuery = `
  query FollowersOfProfileSorted($profileId: String!, $first: Int!, $skip: Int!) {
    profile(id: $profileId) {
      followers(first: $first, skip: $skip, orderBy: timestamp, orderDirection: asc) {
        account {
          id
        }
      }
    }
  }
`

export const getFollowers = async ({ profileId, first, skip = 0 }: { profileId: string, first: number, skip: number }): Promise<string[]> => {
  await sleep(REQUEST_DELAY)
  const result = await client
    .query(FollowersOfProfileIdSortedQuery, { profileId, first, skip })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  if (!result.data.profile?.followers) {
    // Profile has no followers
    return []
  }

  return result.data.profile.followers.map((f: { account: { id: string } }) => (f.account.id))
}

const FollowedByAddressSortedQuery = `
  query FollowedByAddress($ethereumAddress: Bytes!, $first: Int!, $skip: Int!) {
    account(id: $ethereumAddress) {
      following(first: $first, skip: $skip, orderBy: timestamp, orderDirection: asc) {
        profile {
          id
        }
      }
    }
  }
`

export const getFollowing = async ({ ethereumAddress, first, skip = 0 }: { ethereumAddress: string, first: number, skip: number }): Promise<string[]> => {
  await sleep(REQUEST_DELAY)
  const result = await client
    .query(FollowedByAddressSortedQuery, { ethereumAddress, first, skip })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  if (!result.data.account?.following) {
    // Address is not following anyone
    return []
  }

  return result.data.account.following.map((f: { profile: { id: string } }) => (f.profile.id))
}