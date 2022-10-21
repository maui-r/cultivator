import { sleep } from '../helpers'
import client from './client'
import { graphql } from './schema'
import { HasTxHashBeenIndexedRequest } from './schema/graphql'

const HasTxBeenIndexedRequest = graphql(`
  query HasTxHashBeenIndexed($txHash: TxHash, $txId: TxId) {
    hasTxHashBeenIndexed(request: { txHash: $txHash, txId: $txId }) {
      ... on TransactionIndexedResult {
        indexed
        txReceipt {
            transactionHash
        }
        metadataStatus {
          status
          reason
        }
      }
      ... on TransactionError {
        reason
      }
    }
  }
`)

const hasTxBeenIndexed = async (input: HasTxHashBeenIndexedRequest) => {
    const result = await client
        .query(HasTxBeenIndexedRequest, input)
        .toPromise()

    if (!result.data) {
        throw new Error('No result data')
    }

    return result.data.hasTxHashBeenIndexed
}

export const pollUntilIndexed = async (input: HasTxHashBeenIndexedRequest) => {
    while (true) {
        const txResult = await hasTxBeenIndexed(input)
        if (txResult.__typename === 'TransactionError') {
            throw new Error(txResult.reason)
        }
        if (txResult.__typename !== 'TransactionIndexedResult') {
            throw new Error(`Unexpected result type: ${txResult.__typename}`)
        }
        if (txResult.metadataStatus && txResult.metadataStatus.status === 'PENDING') {
            await sleep(1000)
            continue
        }
        if (txResult.metadataStatus && txResult.metadataStatus.status !== 'SUCCESS') {
            throw new Error(txResult.metadataStatus.reason ?? txResult.metadataStatus.status)
        }
        if (!txResult.indexed) {
            await sleep(1000)
            continue
        }
        return txResult
    }
}