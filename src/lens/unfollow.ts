import { graphql } from './schema'
import client from './client'
import { UnfollowRequest } from './schema/graphql'

const CreateUnfollowTypedDataMutation = graphql(`
  mutation CreateUnfollowTypedData($request: UnfollowRequest!) {
    createUnfollowTypedData(request: $request) {
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
          BurnWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          tokenId
        }
      }
    }
  }
`)

export const createUnfollowTypedData = async (request: UnfollowRequest) => {
  const result = await client
    .mutation(CreateUnfollowTypedDataMutation, { request })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.createUnfollowTypedData
}