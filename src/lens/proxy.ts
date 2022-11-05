import api from './client'
import { graphql } from './schema'
import { sleep } from '../helpers'
import { ProxyActionStatusResult, ProxyActionStatusTypes } from './schema/graphql'

const ProxyActionStatusRequest = graphql(`
  query ProxyActionStatus($proxyActionId: ProxyActionId!) {
    proxyActionStatus(proxyActionId: $proxyActionId) {
      ... on ProxyActionStatusResult {
        txHash
        txId
        status
      }
      ... on ProxyActionError {
        reason
      }
      ... on ProxyActionQueued {
        queuedAt
      }
    }
  }
`)

export const getProxyActionStatus = async ({ proxyActionId }: { proxyActionId: string }) => {
  const result = await api.client
    .query(ProxyActionStatusRequest, { proxyActionId })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.proxyActionStatus
}

export const pollProxyActionResult = async (proxyActionId: string): Promise<ProxyActionStatusResult> => {
  while (true) {
    const statusResult = await getProxyActionStatus({ proxyActionId })
    if (statusResult.__typename === 'ProxyActionStatusResult') {
      if (statusResult.status === ProxyActionStatusTypes.Complete) {
        // proxy action completed
        return statusResult
      }
    }
    if (statusResult.__typename === 'ProxyActionError') {
      // proxy action failed
      throw new Error(statusResult.reason)
    }
    await sleep(1000)
  }
}

const ProxyActionFreeFollowMutation = graphql(`
  mutation ProxyAction($profileId: ProfileId!) {
    proxyAction(request: {
      follow: {
        freeFollow: {
          profileId: $profileId
        }
      }
    })
  }
`)

export const proxyActionFreeFollow = async ({ profileId }: { profileId: string }): Promise<string> => {
  const result = await api.client
    .mutation(ProxyActionFreeFollowMutation, { profileId })
    .toPromise()

  if (!result.data) {
    throw new Error('No result data')
  }

  return result.data.proxyAction
}