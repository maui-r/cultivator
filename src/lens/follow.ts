import { fetchSigner, getAccount, getContract, signTypedData } from '@wagmi/core'
import { graphql } from './schema'
import client from './client'
import { signIn } from './auth'
import { utils } from 'ethers'
import { POLYGON_CHAIN_ID } from '../constants'
import { lensHubProxyAbi, lensHubProxyAddress } from '../contracts'

const CreateFollowTypedDataMutation = graphql(`
  mutation CreateFollowTypedData($profileId: ProfileId!) {
    createFollowTypedData(request:{
      follow: [
        {
          profile: $profileId,
          followModule: null
        }
      ]
    }) {
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


const createFollowTypedData = async (profileId: string) => {
  const result = await client
    .mutation(CreateFollowTypedDataMutation, { profileId })
    .toPromise()

  return result.data!.createFollowTypedData.typedData
}

export const follow = async (profileId: string) => {
  await signIn()

  const followTypedData = await createFollowTypedData(profileId)
  // remove __typename fields
  const { __typename: tmp0, ...domain } = followTypedData.domain
  const { __typename: tmp1, ...types } = followTypedData.types
  const { __typename: tmp2, ...value } = followTypedData.value

  // sign
  const signature = await signTypedData({ domain, types, value })
  const { v, r, s } = utils.splitSignature(signature)

  const signer = await fetchSigner({ chainId: POLYGON_CHAIN_ID })
  if (!signer) return // TODO: show error
  const lensHub = getContract({
    address: lensHubProxyAddress,
    abi: lensHubProxyAbi,
    signerOrProvider: signer,
  })

  const { address } = getAccount()
  const tx = await lensHub.followWithSig({
    follower: address,
    profileIds: value.profileIds,
    datas: value.datas,
    sig: {
      v,
      r,
      s,
      deadline: value.deadline,
    },
  })
  console.debug('follow tx hash:', tx.hash)
}