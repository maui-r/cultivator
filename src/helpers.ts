import { MediaSet, NftImage } from './lens/schema/graphql'
import { Node } from './types'

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const parseIpfs = (url: string | undefined): string | undefined => {
  if (!url) return
  if (!url.startsWith('ipfs://')) return url
  return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
}

export const getProfilePictureUrl = (profile: { picture?: MediaSet | Pick<NftImage, '__typename' | 'uri'> | null }) => {
  if (!profile.picture) return

  if (profile.picture?.__typename === 'MediaSet') {
    return parseIpfs(profile.picture.original.url)
  }

  if (profile.picture.__typename === 'NftImage') {
    return parseIpfs(profile.picture.uri)
  }
}

export const parseOffset = (offsetJson: string): number => {
  return JSON.parse(offsetJson).offset
}

const sortByProfileId = (a: { id: string }, b: { id: string }) => {
  return Number(a.id) - Number(b.id)
}

export const sortProfiles = (profiles: Array<{ id: string, isDefault: boolean }>) => {
  return profiles
    .sort(sortByProfileId)
    .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1))
}

const sortByNumericValue = (a: string, b: string) => {
  return Number(a) - Number(b)
}

export const compareNodes = (oldNodes: { [key: Node['id']]: Node }, newNodes: { [key: Node['id']]: Node }) => {
  const oldNodeIds = Object.keys(oldNodes)
  const newNodeIds = Object.keys(newNodes)
  if (oldNodeIds.length !== newNodeIds.length) return false
  oldNodeIds.sort(sortByNumericValue)
  newNodeIds.sort(sortByNumericValue)
  newNodeIds.forEach((newValue, index) => {
    if (newValue !== oldNodeIds[index]) return false
  })
  return true
}