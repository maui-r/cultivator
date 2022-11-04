import { OptimisticTransaction, OptimisticTransactionStatus } from '../types'
import { hasTxBeenIndexed } from './indexer'
import { getProxyActionStatus } from './proxy'
import { ProxyActionStatusTypes } from './schema/graphql'

export const getOptimisticTransactionStatus = async (transaction: OptimisticTransaction): Promise<OptimisticTransactionStatus> => {
    if (transaction.proxyActionId) {
        const statusResult = await getProxyActionStatus({ proxyActionId: transaction.proxyActionId })
        if (statusResult.__typename === 'ProxyActionStatusResult' && statusResult.status === ProxyActionStatusTypes.Complete) {
            return OptimisticTransactionStatus.success
        }
        if (statusResult.__typename === 'ProxyActionError') {
            return OptimisticTransactionStatus.error
        }
        return OptimisticTransactionStatus.pending
    }

    if (!transaction.txHash && !transaction.txId) {
        throw new Error('Missing transaction property')
    }

    const txResult = await hasTxBeenIndexed({ txHash: transaction.txHash, txId: transaction.txId })
    if (txResult.__typename !== 'TransactionIndexedResult') {
        return OptimisticTransactionStatus.error
    }
    if (txResult.metadataStatus && txResult.metadataStatus.status === 'PENDING') {
        return OptimisticTransactionStatus.pending
    }
    if (txResult.metadataStatus && txResult.metadataStatus.status !== 'SUCCESS') {
        throw new Error(txResult.metadataStatus.reason ?? txResult.metadataStatus.status)
    }
    if (!txResult.indexed) {
        return OptimisticTransactionStatus.pending
    }
    return OptimisticTransactionStatus.success
}