import { parseOffset } from '../helpers'
import { Profile } from '../types'
import api from './client'
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
  const result = await api.client
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
  if (profile.followersPageInfo && cursorOffset >= profile.followersPageInfo.total) {
    throw new Error('No more followers')
  }

  // eslint-disable-next-line no-useless-escape
  const cursor = `{\"offset\":${cursorOffset}}`
  const result = await api.client
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

  const isLast = updatedProfile.followersPageInfo!.next === updatedProfile.followersPageInfo!.total

  return { follower, updatedProfile, isLast }
}

const ProfilesOwnedByAddressQuery = graphql(`
  query ProfilesOwnedByAddress($ethereumAddress: EthereumAddress!) {
    profiles(request: { ownedBy: [$ethereumAddress]}) {
      items {
        id
        isDefault
      }
    }
  }
`)

export const getProfilesOwnedByAddress = async (ethereumAddress: string): Promise<{ id: string, isDefault: boolean }[]> => {
  const result = await api.client
    .query(ProfilesOwnedByAddressQuery, { ethereumAddress })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.profiles.items
}