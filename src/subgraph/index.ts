import { createClient } from 'urql'
import { REQUEST_DELAY, SUBGRAPH_API_URL } from '../constants'
import { sleep } from '../helpers'

const client = createClient({
  url: SUBGRAPH_API_URL,
})
console.debug('the graph client instantiated')


const FollowedByAddressQuery = `
  query manyTokens($ethereumAddress: Bytes!, $lastId: String) {
    account(id: $ethereumAddress) {
      following(first: 1000, where: { id_gt: $lastId}) {
        id
        profile {
          id
        }
      }
    }
  }
`

export const getAllFollowing = async (ethereumAddress: string): Promise<string[]> => {
  const following = []

  let result
  let lastId = ''
  do {
    result = await client
      .query(FollowedByAddressQuery, { ethereumAddress, lastId })
      .toPromise()

    if (!result.data) {
      throw new Error('No result data')
    }

    for (let followRelation of result.data.account.following) {
      following.push(followRelation.profile.id)
      lastId = followRelation.id
    }
    console.debug('.... fetched', result.data.account.following.length, 'following ids')
    sleep(REQUEST_DELAY)
  } while (result.data.account.following.length === 1000)

  return following
}