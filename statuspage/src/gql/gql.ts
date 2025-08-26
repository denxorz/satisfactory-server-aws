/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n      mutation RebuildSaveDetails {\n        rebuildSaveDetails {\n          status\n        }\n      }\n    ": typeof types.RebuildSaveDetailsDocument,
    "\n      query SaveDetailsBuildInfo {\n        saveDetailsBuildInfo {\n          fileName\n          fileDate\n          parsedDate\n        }\n      }\n    ": typeof types.SaveDetailsBuildInfoDocument,
    "\n      subscription statusChanged {\n        statusChanged {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    ": typeof types.StatusChangedDocument,
    "\n      mutation start {\n        start {\n          status\n          previousStatus\n          detail\n        }\n      }\n    ": typeof types.StartDocument,
    "\n      query lastSave {\n        lastSave {\n          url\n        }\n      }\n    ": typeof types.LastSaveDocument,
    "\n      query lastLog {\n        lastLog {\n          url\n        }\n      }\n    ": typeof types.LastLogDocument,
    "\n      query status {\n        status(id: \"last\") {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    ": typeof types.StatusDocument,
    "\n      query gameServerProbe($host: String, $port: Int) {\n        gameServerProbe(host: $host, port: $port) {\n          success\n          error\n          serverState\n          serverVersion\n          serverName\n        }\n      }\n    ": typeof types.GameServerProbeDocument,
    "\n      query saveDetails {\n        saveDetails {\n          stations {\n            cargoTypes\n            cargoFlows {\n              type\n              isUnload\n              flowPerMinute\n              isExact\n            }\n            id\n            isUnload\n            name\n            shortName\n            type\n            transporters {\n              id\n              name\n              from\n              to\n              otherStops\n            }\n            x\n            y\n          }\n        }\n      }\n    ": typeof types.SaveDetailsDocument,
};
const documents: Documents = {
    "\n      mutation RebuildSaveDetails {\n        rebuildSaveDetails {\n          status\n        }\n      }\n    ": types.RebuildSaveDetailsDocument,
    "\n      query SaveDetailsBuildInfo {\n        saveDetailsBuildInfo {\n          fileName\n          fileDate\n          parsedDate\n        }\n      }\n    ": types.SaveDetailsBuildInfoDocument,
    "\n      subscription statusChanged {\n        statusChanged {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    ": types.StatusChangedDocument,
    "\n      mutation start {\n        start {\n          status\n          previousStatus\n          detail\n        }\n      }\n    ": types.StartDocument,
    "\n      query lastSave {\n        lastSave {\n          url\n        }\n      }\n    ": types.LastSaveDocument,
    "\n      query lastLog {\n        lastLog {\n          url\n        }\n      }\n    ": types.LastLogDocument,
    "\n      query status {\n        status(id: \"last\") {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    ": types.StatusDocument,
    "\n      query gameServerProbe($host: String, $port: Int) {\n        gameServerProbe(host: $host, port: $port) {\n          success\n          error\n          serverState\n          serverVersion\n          serverName\n        }\n      }\n    ": types.GameServerProbeDocument,
    "\n      query saveDetails {\n        saveDetails {\n          stations {\n            cargoTypes\n            cargoFlows {\n              type\n              isUnload\n              flowPerMinute\n              isExact\n            }\n            id\n            isUnload\n            name\n            shortName\n            type\n            transporters {\n              id\n              name\n              from\n              to\n              otherStops\n            }\n            x\n            y\n          }\n        }\n      }\n    ": types.SaveDetailsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      mutation RebuildSaveDetails {\n        rebuildSaveDetails {\n          status\n        }\n      }\n    "): (typeof documents)["\n      mutation RebuildSaveDetails {\n        rebuildSaveDetails {\n          status\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query SaveDetailsBuildInfo {\n        saveDetailsBuildInfo {\n          fileName\n          fileDate\n          parsedDate\n        }\n      }\n    "): (typeof documents)["\n      query SaveDetailsBuildInfo {\n        saveDetailsBuildInfo {\n          fileName\n          fileDate\n          parsedDate\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      subscription statusChanged {\n        statusChanged {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    "): (typeof documents)["\n      subscription statusChanged {\n        statusChanged {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      mutation start {\n        start {\n          status\n          previousStatus\n          detail\n        }\n      }\n    "): (typeof documents)["\n      mutation start {\n        start {\n          status\n          previousStatus\n          detail\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query lastSave {\n        lastSave {\n          url\n        }\n      }\n    "): (typeof documents)["\n      query lastSave {\n        lastSave {\n          url\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query lastLog {\n        lastLog {\n          url\n        }\n      }\n    "): (typeof documents)["\n      query lastLog {\n        lastLog {\n          url\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query status {\n        status(id: \"last\") {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    "): (typeof documents)["\n      query status {\n        status(id: \"last\") {\n          id\n          status\n          previousStatus\n          detail\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query gameServerProbe($host: String, $port: Int) {\n        gameServerProbe(host: $host, port: $port) {\n          success\n          error\n          serverState\n          serverVersion\n          serverName\n        }\n      }\n    "): (typeof documents)["\n      query gameServerProbe($host: String, $port: Int) {\n        gameServerProbe(host: $host, port: $port) {\n          success\n          error\n          serverState\n          serverVersion\n          serverName\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query saveDetails {\n        saveDetails {\n          stations {\n            cargoTypes\n            cargoFlows {\n              type\n              isUnload\n              flowPerMinute\n              isExact\n            }\n            id\n            isUnload\n            name\n            shortName\n            type\n            transporters {\n              id\n              name\n              from\n              to\n              otherStops\n            }\n            x\n            y\n          }\n        }\n      }\n    "): (typeof documents)["\n      query saveDetails {\n        saveDetails {\n          stations {\n            cargoTypes\n            cargoFlows {\n              type\n              isUnload\n              flowPerMinute\n              isExact\n            }\n            id\n            isUnload\n            name\n            shortName\n            type\n            transporters {\n              id\n              name\n              from\n              to\n              otherStops\n            }\n            x\n            y\n          }\n        }\n      }\n    "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;