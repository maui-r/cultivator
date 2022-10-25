import { fetchSigner, getAccount, getContract, signTypedData } from '@wagmi/core'
import { graphql } from './schema'
import client from './client'
import { signIn } from './auth'
import { utils } from 'ethers'
import { APP_CHAIN_ID } from '../constants'
import { lensHubProxyAbi, lensHubProxyAddress } from '../contracts'
import { pollProxyActionResult, proxyActionFreeFollow } from './proxy'
import { broadcast } from './broadcast'
import { pollUntilIndexed } from './indexer'
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

const createFollowTypedData = async (request: FollowRequest) => {
  const result = await client
    .mutation(CreateFollowTypedDataMutation, { request })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.createFollowTypedData
}

const followProxy = async ({ profileId }: { profileId: string }) => {
  const proxyActionFreeFollowResult = await proxyActionFreeFollow({ profileId })
  const proxyActionResult = await pollProxyActionResult(proxyActionFreeFollowResult)
  console.debug('follow tx hash:', proxyActionResult.txHash)
}

const followBroadcast = async ({ followTypedData, signature }: { followTypedData: any, signature: string }) => {
  const broadcastResult = await broadcast({ id: followTypedData.id, signature, })
  if (broadcastResult.__typename === 'RelayError') {
    throw new Error(broadcastResult.reason)
  }
  if (broadcastResult.__typename !== 'RelayerResult') {
    throw new Error(`Unexpected broadcast result type: ${broadcastResult.__typename}`)
  }
  const indexedResult = await pollUntilIndexed({ txId: broadcastResult.txId })
  console.debug('follow tx hash:', indexedResult.txReceipt?.transactionHash)
}

const followContract = async ({ signature, value }: { signature: string, value: any }) => {
  const { v, r, s } = utils.splitSignature(signature)

  const signer = await fetchSigner({ chainId: APP_CHAIN_ID })
  if (!signer) return // TODO: show/catch error

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

export const follow = async ({ profileId }: { profileId: string }) => {
  await signIn()

  // TODO: check if already following?

  try {
    await followProxy({ profileId })
    return
  } catch {
    console.log('proxy follow failed')
  }

  // TODO: construct request depending on follow module
  const request = { follow: [{ profile: profileId }] }

  const followTypedData = await createFollowTypedData(request)
  // remove __typename fields
  const { __typename: tmp0, ...domain } = followTypedData.typedData.domain
  const { __typename: tmp1, ...types } = followTypedData.typedData.types
  const { __typename: tmp2, ...value } = followTypedData.typedData.value

  // ask user to sign typed data
  const signature = await signTypedData({ domain, types, value })

  try {
    await followBroadcast({ followTypedData, signature })
    return
  } catch {
    console.log('broadcast follow failed')
  }

  try {
    await followContract({ value, signature })
    return
  } catch {
    console.log('contract call follow failed')
  }

  // TODO: show error
}