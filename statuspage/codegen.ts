
import type { CodegenConfig } from '@graphql-codegen/cli';
import { Types } from '@graphql-codegen/plugin-helpers';

const config: CodegenConfig = {
  overwrite: true,
  schema: "../server-hosting/apischema.graphql",
  documents: "src/**/*.vue",
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
      config: {
        useTypeImports: true
      }
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
};

export default config;
