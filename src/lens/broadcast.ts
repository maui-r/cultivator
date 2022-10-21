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

export const broadcast = async ({ id, signature }: { id: string, signature: string }) => {
  const result = await client
    .mutation(BroadcastMutation, { id, signature })
    .toPromise()

  return result.data!.broadcast
}
