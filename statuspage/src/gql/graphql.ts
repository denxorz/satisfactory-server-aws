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
  trainStations?: Maybe<Array<Maybe<TrainStation>>>;
};

export type Status = {
  __typename?: 'Status';
  detail?: Maybe<Scalars['String']['output']>;
  previousStatus?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type Train = {
  __typename?: 'Train';
  id?: Maybe<Scalars['String']['output']>;
};

export type TrainStation = {
  __typename?: 'TrainStation';
  cargoType?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  isUnload?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  trains?: Maybe<Array<Maybe<Train>>>;
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


export type SaveDetailsQuery = { __typename?: 'Query', saveDetails?: { __typename?: 'SaveDetails', trainStations?: Array<{ __typename?: 'TrainStation', cargoType?: string | null, id?: string | null, isUnload?: boolean | null, name?: string | null, trains?: Array<{ __typename?: 'Train', id?: string | null } | null> | null } | null> | null } | null };


export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const StartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatus"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}}]} as unknown as DocumentNode<StartMutation, StartMutationVariables>;
export const LastSaveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"lastSave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastSave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<LastSaveQuery, LastSaveQueryVariables>;
export const LastLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"lastLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<LastLogQuery, LastLogQueryVariables>;
export const SaveDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"saveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trainStations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cargoType"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isUnload"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trains"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SaveDetailsQuery, SaveDetailsQueryVariables>;