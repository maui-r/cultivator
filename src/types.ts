import { Profile as LensProfile } from './lens/schema/graphql'

export enum NodeStyle {
    Bubble = 'Bubble',
    LensHandle = 'LensHandle',
}

export enum ColorMode {
    System = 'System',
    Light = 'Light',
    Dark = 'Dark',
}

export type CurrentProfile = Pick<LensProfile, 'id' | 'handle'>

export type QueryPageInfo = {
    next: number,
    total: number,
}

export type Profile = {
    id: string,
    handle: string,
    ownedBy: string,
    following: Array<Node['id']>,
    followingPageInfo?: QueryPageInfo,
    followersPageInfo?: QueryPageInfo,
}

export type Node = Profile

export type Link = {
    source: string,
    target: string,
}

// optimistic cache
export enum OptimisticAction {
    follow = 'follow',
    unfollow = 'unfollow',
}

export type OptimisticTransaction = {
    action: OptimisticAction
    proxyActionId?: string
    txId?: string
    txHash?: string
}
export enum OptimisticTransactionStatus {
    pending = 'pending',
    error = 'error',
    success = 'success',
}