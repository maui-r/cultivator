import client from './client'
import { graphql } from './schema'

const BroadcastMutation = graphql(`
  mutation Broadcast($id: BroadcastId!, $signature: Signature!) {
    broadcast(request: { id: $id, signature: $signature }) {
      ... on RelayerResult {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }
`)

const broadcast = async ({ id, signature }: { id: string, signature: string }) => {
  const result = await client
    .mutation(BroadcastMutation, { id, signature })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.broadcast
}

export const broadcastTypedData = async ({ typedData, signature }: { typedData: { id: string }, signature: string }) => {
  const broadcastResult = await broadcast({ id: typedData.id, signature, })
  if (broadcastResult.__typename === 'RelayError') {
    throw new Error(broadcastResult.reason)
  }
  if (broadcastResult.__typename !== 'RelayerResult') {
    throw new Error(`Unexpected broadcast result type: ${broadcastResult.__typename}`)
  }
  return broadcastResult.txId
}