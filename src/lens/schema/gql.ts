/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  query Challenge($address: EthereumAddress!) {\n    challenge(request: { address: $address }) {\n      text\n    }\n  }\n": types.ChallengeDocument,
    "\n  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {\n    authenticate(request: {\n      address: $address,\n      signature: $signature\n    }) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.AuthenticateDocument,
    "\n  mutation Refresh($refreshToken: Jwt!) {\n    refresh(request: { refreshToken: $refreshToken }) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RefreshDocument,
};

export function graphql(source: "\n  query Challenge($address: EthereumAddress!) {\n    challenge(request: { address: $address }) {\n      text\n    }\n  }\n"): (typeof documents)["\n  query Challenge($address: EthereumAddress!) {\n    challenge(request: { address: $address }) {\n      text\n    }\n  }\n"];
export function graphql(source: "\n  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {\n    authenticate(request: {\n      address: $address,\n      signature: $signature\n    }) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {\n    authenticate(request: {\n      address: $address,\n      signature: $signature\n    }) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
export function graphql(source: "\n  mutation Refresh($refreshToken: Jwt!) {\n    refresh(request: { refreshToken: $refreshToken }) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation Refresh($refreshToken: Jwt!) {\n    refresh(request: { refreshToken: $refreshToken }) {\n      accessToken\n      refreshToken\n    }\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;