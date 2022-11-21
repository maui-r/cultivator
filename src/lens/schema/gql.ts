/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  query Challenge($address: EthereumAddress!) {\n    challenge(request: { address: $address }) {\n      text\n    }\n  }\n": types.ChallengeDocument,
    "\n  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {\n    authenticate(request: {\n      address: $address,\n      signature: $signature\n    }) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.AuthenticateDocument,
    "\nquery Search($request: SearchQueryRequest!) {\n  search(request: $request) {\n    ... on ProfileSearchResult {\n      __typename \n      items {\n        ... on Profile {\n          id\n          name\n          handle\n        }\n      }\n    }\n  }\n}\n": types.SearchDocument,
    "\n  query ProfilePicture($profileId: ProfileId!) {\n    profile(request: { profileId: $profileId }) {\n      picture {\n        ... on NftImage {\n          uri\n        }\n        ... on MediaSet {\n          original {\n            url\n            mimeType\n          }\n        }\n        __typename\n      }\n    }\n  }\n": types.ProfilePictureDocument,
    "\n  query Profile($profileId: ProfileId!) {\n    profile(request: { profileId: $profileId }) {\n      id\n      name\n      handle\n      bio\n      picture {\n        ... on NftImage {\n          uri\n        }\n        ... on MediaSet {\n          original {\n            url\n            mimeType\n          }\n        }\n        __typename\n      }\n      stats {\n        totalFollowers\n        totalFollowing\n        totalPosts\n        totalComments\n        totalMirrors\n        totalCollects\n      }\n      isFollowedByMe\n      followModule {\n        ... on UnknownFollowModuleSettings {\n         type\n        }\n        ... on RevertFollowModuleSettings {\n         type\n        }\n        ... on ProfileFollowModuleSettings {\n         type\n        }\n        ... on FeeFollowModuleSettings {\n          type\n          amount {\n            asset {\n              symbol\n              name\n              decimals\n              address\n            }\n            value\n          }\n        }\n      }\n    }\n  }\n": types.ProfileDocument,
    "\n  mutation Broadcast($id: BroadcastId!, $signature: Signature!) {\n    broadcast(request: { id: $id, signature: $signature }) {\n      ... on RelayerResult {\n        txHash\n        txId\n      }\n      ... on RelayError {\n        reason\n      }\n    }\n  }\n": types.BroadcastDocument,
    "\n  mutation Refresh($refreshToken: Jwt!) {\n    refresh(request: { refreshToken: $refreshToken }) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RefreshDocument,
    "\n  mutation CreateFollowTypedData($request: FollowRequest!) {\n    createFollowTypedData(request: $request) {\n      id\n      expiresAt\n      typedData {\n        domain {\n          name\n          chainId\n          version\n          verifyingContract\n        }\n        types {\n          FollowWithSig {\n            name\n            type\n          }\n        }\n        value {\n          nonce\n          deadline\n          profileIds\n          datas\n        }\n      }\n    }\n  }\n": types.CreateFollowTypedDataDocument,
    "\n  query HasTxHashBeenIndexed($txHash: TxHash, $txId: TxId) {\n    hasTxHashBeenIndexed(request: { txHash: $txHash, txId: $txId }) {\n      ... on TransactionIndexedResult {\n        indexed\n        txReceipt {\n            transactionHash\n        }\n        metadataStatus {\n          status\n          reason\n        }\n      }\n      ... on TransactionError {\n        reason\n      }\n    }\n  }\n": types.HasTxHashBeenIndexedDocument,
    "\n  query ProfileMinByHandle($handle: Handle!) {\n    profile(request: { handle: $handle }) {\n      id\n      handle\n      ownedBy\n    }\n  }\n": types.ProfileMinByHandleDocument,
    "\n  query ProfileMinById($id: ProfileId!) {\n    profile(request: { profileId: $id }) {\n      id\n      handle\n      ownedBy\n    }\n  }\n": types.ProfileMinByIdDocument,
    "\n  query ProfilesOwnedByAddress($ethereumAddress: EthereumAddress!) {\n    profiles(request: { ownedBy: [$ethereumAddress]}) {\n      items {\n        id\n        isDefault\n      }\n    }\n  }\n": types.ProfilesOwnedByAddressDocument,
    "\n  query ProxyActionStatus($proxyActionId: ProxyActionId!) {\n    proxyActionStatus(proxyActionId: $proxyActionId) {\n      ... on ProxyActionStatusResult {\n        txHash\n        txId\n        status\n      }\n      ... on ProxyActionError {\n        reason\n      }\n      ... on ProxyActionQueued {\n        queuedAt\n      }\n    }\n  }\n": types.ProxyActionStatusDocument,
    "\n  mutation ProxyAction($profileId: ProfileId!) {\n    proxyAction(request: {\n      follow: {\n        freeFollow: {\n          profileId: $profileId\n        }\n      }\n    })\n  }\n": types.ProxyActionDocument,
    "\n  mutation CreateUnfollowTypedData($request: UnfollowRequest!) {\n    createUnfollowTypedData(request: $request) {\n      id\n      expiresAt\n      typedData {\n        domain {\n          name\n          chainId\n          version\n          verifyingContract\n        }\n        types {\n          BurnWithSig {\n            name\n            type\n          }\n        }\n        value {\n          nonce\n          deadline\n          tokenId\n        }\n      }\n    }\n  }\n": types.CreateUnfollowTypedDataDocument,
};

export function graphql(source: "\n  query Challenge($address: EthereumAddress!) {\n    challenge(request: { address: $address }) {\n      text\n    }\n  }\n"): (typeof documents)["\n  query Challenge($address: EthereumAddress!) {\n    challenge(request: { address: $address }) {\n      text\n    }\n  }\n"];
export function graphql(source: "\n  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {\n    authenticate(request: {\n      address: $address,\n      signature: $signature\n    }) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {\n    authenticate(request: {\n      address: $address,\n      signature: $signature\n    }) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
export function graphql(source: "\nquery Search($request: SearchQueryRequest!) {\n  search(request: $request) {\n    ... on ProfileSearchResult {\n      __typename \n      items {\n        ... on Profile {\n          id\n          name\n          handle\n        }\n      }\n    }\n  }\n}\n"): (typeof documents)["\nquery Search($request: SearchQueryRequest!) {\n  search(request: $request) {\n    ... on ProfileSearchResult {\n      __typename \n      items {\n        ... on Profile {\n          id\n          name\n          handle\n        }\n      }\n    }\n  }\n}\n"];
export function graphql(source: "\n  query ProfilePicture($profileId: ProfileId!) {\n    profile(request: { profileId: $profileId }) {\n      picture {\n        ... on NftImage {\n          uri\n        }\n        ... on MediaSet {\n          original {\n            url\n            mimeType\n          }\n        }\n        __typename\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProfilePicture($profileId: ProfileId!) {\n    profile(request: { profileId: $profileId }) {\n      picture {\n        ... on NftImage {\n          uri\n        }\n        ... on MediaSet {\n          original {\n            url\n            mimeType\n          }\n        }\n        __typename\n      }\n    }\n  }\n"];
export function graphql(source: "\n  query Profile($profileId: ProfileId!) {\n    profile(request: { profileId: $profileId }) {\n      id\n      name\n      handle\n      bio\n      picture {\n        ... on NftImage {\n          uri\n        }\n        ... on MediaSet {\n          original {\n            url\n            mimeType\n          }\n        }\n        __typename\n      }\n      stats {\n        totalFollowers\n        totalFollowing\n        totalPosts\n        totalComments\n        totalMirrors\n        totalCollects\n      }\n      isFollowedByMe\n      followModule {\n        ... on UnknownFollowModuleSettings {\n         type\n        }\n        ... on RevertFollowModuleSettings {\n         type\n        }\n        ... on ProfileFollowModuleSettings {\n         type\n        }\n        ... on FeeFollowModuleSettings {\n          type\n          amount {\n            asset {\n              symbol\n              name\n              decimals\n              address\n            }\n            value\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Profile($profileId: ProfileId!) {\n    profile(request: { profileId: $profileId }) {\n      id\n      name\n      handle\n      bio\n      picture {\n        ... on NftImage {\n          uri\n        }\n        ... on MediaSet {\n          original {\n            url\n            mimeType\n          }\n        }\n        __typename\n      }\n      stats {\n        totalFollowers\n        totalFollowing\n        totalPosts\n        totalComments\n        totalMirrors\n        totalCollects\n      }\n      isFollowedByMe\n      followModule {\n        ... on UnknownFollowModuleSettings {\n         type\n        }\n        ... on RevertFollowModuleSettings {\n         type\n        }\n        ... on ProfileFollowModuleSettings {\n         type\n        }\n        ... on FeeFollowModuleSettings {\n          type\n          amount {\n            asset {\n              symbol\n              name\n              decimals\n              address\n            }\n            value\n          }\n        }\n      }\n    }\n  }\n"];
export function graphql(source: "\n  mutation Broadcast($id: BroadcastId!, $signature: Signature!) {\n    broadcast(request: { id: $id, signature: $signature }) {\n      ... on RelayerResult {\n        txHash\n        txId\n      }\n      ... on RelayError {\n        reason\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Broadcast($id: BroadcastId!, $signature: Signature!) {\n    broadcast(request: { id: $id, signature: $signature }) {\n      ... on RelayerResult {\n        txHash\n        txId\n      }\n      ... on RelayError {\n        reason\n      }\n    }\n  }\n"];
export function graphql(source: "\n  mutation Refresh($refreshToken: Jwt!) {\n    refresh(request: { refreshToken: $refreshToken }) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation Refresh($refreshToken: Jwt!) {\n    refresh(request: { refreshToken: $refreshToken }) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
export function graphql(source: "\n  mutation CreateFollowTypedData($request: FollowRequest!) {\n    createFollowTypedData(request: $request) {\n      id\n      expiresAt\n      typedData {\n        domain {\n          name\n          chainId\n          version\n          verifyingContract\n        }\n        types {\n          FollowWithSig {\n            name\n            type\n          }\n        }\n        value {\n          nonce\n          deadline\n          profileIds\n          datas\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFollowTypedData($request: FollowRequest!) {\n    createFollowTypedData(request: $request) {\n      id\n      expiresAt\n      typedData {\n        domain {\n          name\n          chainId\n          version\n          verifyingContract\n        }\n        types {\n          FollowWithSig {\n            name\n            type\n          }\n        }\n        value {\n          nonce\n          deadline\n          profileIds\n          datas\n        }\n      }\n    }\n  }\n"];
export function graphql(source: "\n  query HasTxHashBeenIndexed($txHash: TxHash, $txId: TxId) {\n    hasTxHashBeenIndexed(request: { txHash: $txHash, txId: $txId }) {\n      ... on TransactionIndexedResult {\n        indexed\n        txReceipt {\n            transactionHash\n        }\n        metadataStatus {\n          status\n          reason\n        }\n      }\n      ... on TransactionError {\n        reason\n      }\n    }\n  }\n"): (typeof documents)["\n  query HasTxHashBeenIndexed($txHash: TxHash, $txId: TxId) {\n    hasTxHashBeenIndexed(request: { txHash: $txHash, txId: $txId }) {\n      ... on TransactionIndexedResult {\n        indexed\n        txReceipt {\n            transactionHash\n        }\n        metadataStatus {\n          status\n          reason\n        }\n      }\n      ... on TransactionError {\n        reason\n      }\n    }\n  }\n"];
export function graphql(source: "\n  query ProfileMinByHandle($handle: Handle!) {\n    profile(request: { handle: $handle }) {\n      id\n      handle\n      ownedBy\n    }\n  }\n"): (typeof documents)["\n  query ProfileMinByHandle($handle: Handle!) {\n    profile(request: { handle: $handle }) {\n      id\n      handle\n      ownedBy\n    }\n  }\n"];
export function graphql(source: "\n  query ProfileMinById($id: ProfileId!) {\n    profile(request: { profileId: $id }) {\n      id\n      handle\n      ownedBy\n    }\n  }\n"): (typeof documents)["\n  query ProfileMinById($id: ProfileId!) {\n    profile(request: { profileId: $id }) {\n      id\n      handle\n      ownedBy\n    }\n  }\n"];
export function graphql(source: "\n  query ProfilesOwnedByAddress($ethereumAddress: EthereumAddress!) {\n    profiles(request: { ownedBy: [$ethereumAddress]}) {\n      items {\n        id\n        isDefault\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProfilesOwnedByAddress($ethereumAddress: EthereumAddress!) {\n    profiles(request: { ownedBy: [$ethereumAddress]}) {\n      items {\n        id\n        isDefault\n      }\n    }\n  }\n"];
export function graphql(source: "\n  query ProxyActionStatus($proxyActionId: ProxyActionId!) {\n    proxyActionStatus(proxyActionId: $proxyActionId) {\n      ... on ProxyActionStatusResult {\n        txHash\n        txId\n        status\n      }\n      ... on ProxyActionError {\n        reason\n      }\n      ... on ProxyActionQueued {\n        queuedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProxyActionStatus($proxyActionId: ProxyActionId!) {\n    proxyActionStatus(proxyActionId: $proxyActionId) {\n      ... on ProxyActionStatusResult {\n        txHash\n        txId\n        status\n      }\n      ... on ProxyActionError {\n        reason\n      }\n      ... on ProxyActionQueued {\n        queuedAt\n      }\n    }\n  }\n"];
export function graphql(source: "\n  mutation ProxyAction($profileId: ProfileId!) {\n    proxyAction(request: {\n      follow: {\n        freeFollow: {\n          profileId: $profileId\n        }\n      }\n    })\n  }\n"): (typeof documents)["\n  mutation ProxyAction($profileId: ProfileId!) {\n    proxyAction(request: {\n      follow: {\n        freeFollow: {\n          profileId: $profileId\n        }\n      }\n    })\n  }\n"];
export function graphql(source: "\n  mutation CreateUnfollowTypedData($request: UnfollowRequest!) {\n    createUnfollowTypedData(request: $request) {\n      id\n      expiresAt\n      typedData {\n        domain {\n          name\n          chainId\n          version\n          verifyingContract\n        }\n        types {\n          BurnWithSig {\n            name\n            type\n          }\n        }\n        value {\n          nonce\n          deadline\n          tokenId\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUnfollowTypedData($request: UnfollowRequest!) {\n    createUnfollowTypedData(request: $request) {\n      id\n      expiresAt\n      typedData {\n        domain {\n          name\n          chainId\n          version\n          verifyingContract\n        }\n        types {\n          BurnWithSig {\n            name\n            type\n          }\n        }\n        value {\n          nonce\n          deadline\n          tokenId\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;