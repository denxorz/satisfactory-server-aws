 
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
  isExact?: Maybe<Scalars['Boolean']['output']>;
  isUnload?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type File = {
  __typename?: 'File';
  url?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  start?: Maybe<Status>;
};

export type Query = {
  __typename?: 'Query';
  lastLog?: Maybe<File>;
  lastSave?: Maybe<File>;
  saveDetails?: Maybe<SaveDetails>;
  status?: Maybe<Status>;
};

export type SaveDetails = {
  __typename?: 'SaveDetails';
  stations?: Maybe<Array<Maybe<Station>>>;
};

export type Station = {
  __typename?: 'Station';
  cargoFlows?: Maybe<Array<Maybe<CargoFlow>>>;
  cargoTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id?: Maybe<Scalars['String']['output']>;
  isUnload?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  transporters?: Maybe<Array<Maybe<Transporter>>>;
  type?: Maybe<Scalars['String']['output']>;
  x?: Maybe<Scalars['Float']['output']>;
  y?: Maybe<Scalars['Float']['output']>;
};

export type Status = {
  __typename?: 'Status';
  detail?: Maybe<Scalars['String']['output']>;
  previousStatus?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type Transporter = {
  __typename?: 'Transporter';
  id?: Maybe<Scalars['String']['output']>;
};

export type StatusQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusQuery = { __typename?: 'Query', status?: { __typename?: 'Status', status?: string | null, previousStatus?: string | null, detail?: string | null } | null };

export type StartMutationVariables = Exact<{ [key: string]: never; }>;


export type StartMutation = { __typename?: 'Mutation', start?: { __typename?: 'Status', status?: string | null, previousStatus?: string | null, detail?: string | null } | null };

export type LastSaveQueryVariables = Exact<{ [key: string]: never; }>;


export type LastSaveQuery = { __typename?: 'Query', lastSave?: { __typename?: 'File', url?: string | null } | null };

export type LastLogQueryVariables = Exact<{ [key: string]: never; }>;


export type LastLogQuery = { __typename?: 'Query', lastLog?: { __typename?: 'File', url?: string | null } | null };

export type SaveDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type SaveDetailsQuery = { __typename?: 'Query', saveDetails?: { __typename?: 'SaveDetails', stations?: Array<{ __typename?: 'Station', cargoTypes?: Array<string | null> | null, id?: string | null, isUnload?: boolean | null, name?: string | null, type?: string | null, x?: number | null, y?: number | null, cargoFlows?: Array<{ __typename?: 'CargoFlow', type?: string | null, isUnload?: boolean | null, flowPerMinute?: number | null, isExact?: boolean | null } | null> | null, transporters?: Array<{ __typename?: 'Transporter', id?: string | null } | null> | null } | null> | null } | null };


export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const StartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StartMutation, StartMutationVariables>;
export const LastSaveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"lastSave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastSave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<LastSaveQuery, LastSaveQueryVariables>;
export const LastLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"lastLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<LastLogQuery, LastLogQueryVariables>;
export const SaveDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"saveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cargoTypes"}},{"kind":"Field","name":{"kind":"Name","value":"cargoFlows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isUnload"}},{"kind":"Field","name":{"kind":"Name","value":"flowPerMinute"}},{"kind":"Field","name":{"kind":"Name","value":"isExact"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isUnload"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"transporters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}}]}}]}}]} as unknown as DocumentNode<SaveDetailsQuery, SaveDetailsQueryVariables>;