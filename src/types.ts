export enum ColorMode {
  System = 'System',
  Light = 'Light',
  Dark = 'Dark',
}

export enum GraphLayout {
  Circular = 'Circular',
  Concentric = 'Concentric',
  Grid = 'Grid',
  Radial = 'Radial',
}

export type QueryState = {
  queried: number,
  withoutProfile?: number,
  allQueried?: boolean,
}

export type Profile = {
  id: string,
  handle: string,
  ownedBy: string,
  following: Array<Node['id']>,
  queriedFollowers?: QueryState,
  queriedFollowing?: QueryState,
}

export type Node = Profile

export type Edge = {
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

// deprecated
export enum NodeStyle {
  Bubble = 'Bubble',
  LensHandle = 'LensHandle',
}