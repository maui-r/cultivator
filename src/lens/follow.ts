import { graphql } from './schema'
import client from './client'
import { proxyActionFreeFollow } from './proxy'
import { broadcast } from './broadcast'
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
  const result = await client
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

export const followBroadcast = async ({ followTypedData, signature }: { followTypedData: any, signature: string }) => {
  const broadcastResult = await broadcast({ id: followTypedData.id, signature, })
  if (broadcastResult.__typename === 'RelayError') {
    throw new Error(broadcastResult.reason)
  }
  if (broadcastResult.__typename !== 'RelayerResult') {
    throw new Error(`Unexpected broadcast result type: ${broadcastResult.__typename}`)
  }
  return broadcastResult.txId
}