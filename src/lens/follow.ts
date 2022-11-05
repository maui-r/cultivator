import { graphql } from './schema'
import api from './client'
import { proxyActionFreeFollow } from './proxy'
import { FollowRequest } from './schema/graphql'

const CreateFollowTypedDataMutation = graphql(`
  mutation CreateFollowTypedData($request: FollowRequest!) {
    createFollowTypedData(request: $request) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          FollowWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          profileIds
          datas
        }
      }
    }
  }
`)

export const createFollowTypedData = async (request: FollowRequest) => {
  const result = await api.client
    .mutation(CreateFollowTypedDataMutation, { request })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.createFollowTypedData
}

export const followProxy = async ({ profileId }: { profileId: string }) => {
  const proxyActionId = await proxyActionFreeFollow({ profileId })
  return proxyActionId
}