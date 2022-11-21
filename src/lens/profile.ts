import api from './client'
import { graphql } from './schema'

const ProfileMinByHandleQuery = graphql(`
  query ProfileMinByHandle($handle: Handle!) {
    profile(request: { handle: $handle }) {
      id
      handle
      ownedBy
    }
  }
`)
const ProfileMinByIdQuery = graphql(`
  query ProfileMinById($id: ProfileId!) {
    profile(request: { profileId: $id }) {
      id
      handle
      ownedBy
    }
  }
`)

export const getProfileMin = async ({ id, handle }: { id?: string, handle?: string }) => {
  if (!id && !handle) {
    throw Error('Either a profile id or handle is required')
  }

  let result
  if (id) {
    result = await api.client
      .query(ProfileMinByIdQuery, { id })
      .toPromise()
  } else {
    result = await api.client
      .query(ProfileMinByHandleQuery, { handle })
      .toPromise()
  }

  if (!result.data?.profile) {
    throw new Error('No result data')
  }

  return result.data.profile
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