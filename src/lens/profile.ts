import { FOLLOWING_LIMIT, REQUEST_DELAY } from '../constants'
import { TooManyFollowingException } from '../errors'
import { parseOffset, sleep } from '../helpers'
import { Profile } from '../types'
import client from './client'
import { graphql } from './schema'

const ProfileMinQuery = graphql(`
  query ProfileMin($handle: Handle!) {
    profile(request: { handle: $handle }) {
      id
      handle
      ownedBy
    }
  }
`)

export const getProfileMin = async (handle: string) => {
  const result = await client
    .query(ProfileMinQuery, { handle })
    .toPromise()

  if (!result.data?.profile) {
    throw new Error('No result data')
  }

  return result.data.profile
}

const ProfileWithFollowersQuery = graphql(`
  query Followers($profileId: ProfileId!, $limit: LimitScalar!, $cursor: Cursor!) {
    followers(request: {
      profileId: $profileId,
      limit: $limit,
      cursor: $cursor
    }) {
      items {
        wallet {
          defaultProfile {
            id
            handle
            ownedBy
          }
        }
      }
      pageInfo {
        next
        totalCount
      }
    }
  }
`)

export const fetchNextFollower = async (profile: Profile) => {
  const cursorOffset = profile.followersPageInfo?.next ?? 0
  // eslint-disable-next-line no-useless-escape
  const cursor = `{\"offset\":${cursorOffset}}`

  const result = await client
    .query(ProfileWithFollowersQuery, { profileId: profile.id, limit: 1, cursor })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }
  if (result.data.followers.items.length !== 1) {
    throw new Error('Unexpected number of followers')
  }

  const follower = result.data.followers.items[0].wallet.defaultProfile

  // update profile
  const updatedProfile: Profile = {
    ...profile,
    followersPageInfo: {
      next: parseOffset(result.data.followers.pageInfo.next),
      total: result.data.followers.pageInfo.totalCount ?? 0,
    }
  }

  return { follower, updatedProfile }
}

const FollowingIdsQuery = graphql(`
  query FollowingIds($address: EthereumAddress!, $cursor: Cursor!) {
    following(request: { 
      address: $address,
      limit: 50,
      cursor: $cursor
    }) {
      items {
        profile {
          id
        }
      }
      pageInfo {
        next
        totalCount
      }
    }
  }
`)

export const getFollowingIds = async ({ address, cursorOffset = 0 }: { address: string, cursorOffset: number }) => {
  // eslint-disable-next-line no-useless-escape
  const cursor = `{\"offset\":${cursorOffset}}`
  const result = await client
    .query(FollowingIdsQuery, { address, cursor })
    .toPromise()

  if (!result.data?.following) {
    throw new Error('No result data')
  }

  return result.data.following
}

export const getProfileNode = async (handleSource: string) => {
  const { id, handle, ownedBy } = await getProfileMin(handleSource)
  let requestCount = 1

  const following: string[] = []
  // TODO: use urql's simplePagination resolver?!
  let total = 0
  let nextOffset = 0
  let result
  do {
    await sleep(REQUEST_DELAY)
    result = await getFollowingIds({ address: ownedBy, cursorOffset: nextOffset })
    requestCount++
    total = result.pageInfo.totalCount ?? 0
    nextOffset = parseOffset(result.pageInfo.next)
    result.items.forEach((item: { profile: { id: string } }) => { following.push(item.profile.id) })
  } while (nextOffset < total && total <= FOLLOWING_LIMIT)

  if (total > FOLLOWING_LIMIT) {
    throw new TooManyFollowingException()
  }

  const profile = { id, handle, ownedBy, following, followingPageInfo: { next: nextOffset, total } }

  return { profile, requestCount }
}