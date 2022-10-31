export const sleep = (milliseconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const parseIpfs = (url: string | undefined): string | undefined => {
    if (!url) return
    if (!url.startsWith('ipfs://')) return url
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
}

export const parseOffset = (offsetJson: string): number => {
    return JSON.parse(offsetJson).offset
}