/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CargoFlow = {
  __typename?: 'CargoFlow';
  flowPerMinute?: Maybe<Scalars['Int']['output']>;
  isExact: Scalars['Boolean']['output'];
  isUnload: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type File = {
  __typename?: 'File';
  url?: Maybe<Scalars['String']['output']>;
};

export type GameServerProbe = {
  __typename?: 'GameServerProbe';
  error?: Maybe<Scalars['String']['output']>;
  serverName?: Maybe<Scalars['String']['output']>;
  serverState?: Maybe<Scalars['String']['output']>;
  serverVersion?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  rebuildSaveDetails?: Maybe<Status>;
  start?: Maybe<Status>;
  updateStatus?: Maybe<Status>;
};


export type MutationUpdateStatusArgs = {
  input?: InputMaybe<StatusInput>;
};

export type Query = {
  __typename?: 'Query';
  gameServerProbe?: Maybe<GameServerProbe>;
  lastLog?: Maybe<File>;
  lastSave?: Maybe<File>;
  saveDetails?: Maybe<SaveDetails>;
  saveDetailsBuildInfo?: Maybe<SaveDetailsBuildInfo>;
  status?: Maybe<Status>;
};


export type QueryGameServerProbeArgs = {
  host?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStatusArgs = {
  id: Scalars['String']['input'];
};

export type SaveDetails = {
  __typename?: 'SaveDetails';
  stations?: Maybe<Array<Station>>;
};

export type SaveDetailsBuildInfo = {
  __typename?: 'SaveDetailsBuildInfo';
  fileDate?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  parsedDate?: Maybe<Scalars['String']['output']>;
};

export type Station = {
  __typename?: 'Station';
  cargoFlows?: Maybe<Array<CargoFlow>>;
  cargoTypes?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['String']['output'];
  isUnload: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  shortName: Scalars['String']['output'];
  transporters?: Maybe<Array<Transporter>>;
  type: Scalars['String']['output'];
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type Status = {
  __typename?: 'Status';
  detail?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  previousStatus?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type StatusInput = {
  detail?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  previousStatus?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  statusChanged?: Maybe<Status>;
};

export type Transporter = {
  __typename?: 'Transporter';
  from: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  otherStops?: Maybe<Array<Scalars['String']['output']>>;
  to?: Maybe<Scalars['String']['output']>;
};

export type RebuildSaveDetailsMutationVariables = Exact<{ [key: string]: never; }>;


export type RebuildSaveDetailsMutation = { __typename?: 'Mutation', rebuildSaveDetails?: { __typename?: 'Status', status?: string | null } | null };

export type SaveDetailsBuildInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type SaveDetailsBuildInfoQuery = { __typename?: 'Query', saveDetailsBuildInfo?: { __typename?: 'SaveDetailsBuildInfo', fileName?: string | null, fileDate?: string | null, parsedDate?: string | null } | null };

export type StatusChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type StatusChangedSubscription = { __typename?: 'Subscription', statusChanged?: { __typename?: 'Status', id?: string | null, status?: string | null, previousStatus?: string | null, detail?: string | null } | null };

export type StartMutationVariables = Exact<{ [key: string]: never; }>;


export type StartMutation = { __typename?: 'Mutation', start?: { __typename?: 'Status', status?: string | null, previousStatus?: string | null, detail?: string | null } | null };

export type LastSaveQueryVariables = Exact<{ [key: string]: never; }>;


export type LastSaveQuery = { __typename?: 'Query', lastSave?: { __typename?: 'File', url?: string | null } | null };

export type LastLogQueryVariables = Exact<{ [key: string]: never; }>;


export type LastLogQuery = { __typename?: 'Query', lastLog?: { __typename?: 'File', url?: string | null } | null };

export type StatusQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusQuery = { __typename?: 'Query', status?: { __typename?: 'Status', id?: string | null, status?: string | null, previousStatus?: string | null, detail?: string | null } | null };

export type GameServerProbeQueryVariables = Exact<{
  host?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GameServerProbeQuery = { __typename?: 'Query', gameServerProbe?: { __typename?: 'GameServerProbe', success: boolean, error?: string | null, serverState?: string | null, serverVersion?: number | null, serverName?: string | null } | null };

export type SaveDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type SaveDetailsQuery = { __typename?: 'Query', saveDetails?: { __typename?: 'SaveDetails', stations?: Array<{ __typename?: 'Station', cargoTypes?: Array<string> | null, id: string, isUnload: boolean, name: string, shortName: string, type: string, x: number, y: number, cargoFlows?: Array<{ __typename?: 'CargoFlow', type: string, isUnload: boolean, flowPerMinute?: number | null, isExact: boolean }> | null, transporters?: Array<{ __typename?: 'Transporter', id: string, name?: string | null, from: string, to?: string | null, otherStops?: Array<string> | null }> | null }> | null } | null };


export const RebuildSaveDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RebuildSaveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rebuildSaveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RebuildSaveDetailsMutation, RebuildSaveDetailsMutationVariables>;
export const SaveDetailsBuildInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SaveDetailsBuildInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveDetailsBuildInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"fileDate"}},{"kind":"Field","name":{"kind":"Name","value":"parsedDate"}}]}}]}}]} as unknown as DocumentNode<SaveDetailsBuildInfoQuery, SaveDetailsBuildInfoQueryVariables>;
export const StatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"statusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StatusChangedSubscription, StatusChangedSubscriptionVariables>;
export const StartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StartMutation, StartMutationVariables>;
export const LastSaveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"lastSave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastSave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<LastSaveQuery, LastSaveQueryVariables>;
export const LastLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"lastLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<LastLogQuery, LastLogQueryVariables>;
export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"last","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const GameServerProbeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"gameServerProbe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"host"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"port"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameServerProbe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"host"},"value":{"kind":"Variable","name":{"kind":"Name","value":"host"}}},{"kind":"Argument","name":{"kind":"Name","value":"port"},"value":{"kind":"Variable","name":{"kind":"Name","value":"port"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"serverState"}},{"kind":"Field","name":{"kind":"Name","value":"serverVersion"}},{"kind":"Field","name":{"kind":"Name","value":"serverName"}}]}}]}}]} as unknown as DocumentNode<GameServerProbeQuery, GameServerProbeQueryVariables>;
export const SaveDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"saveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cargoTypes"}},{"kind":"Field","name":{"kind":"Name","value":"cargoFlows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isUnload"}},{"kind":"Field","name":{"kind":"Name","value":"flowPerMinute"}},{"kind":"Field","name":{"kind":"Name","value":"isExact"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isUnload"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shortName"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"transporters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"otherStops"}}]}},{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}}]}}]}}]} as unknown as DocumentNode<SaveDetailsQuery, SaveDetailsQueryVariables>;