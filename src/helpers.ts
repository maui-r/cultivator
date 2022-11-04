import { MediaSet, NftImage } from './lens/schema/graphql'

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