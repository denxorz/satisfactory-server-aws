
import type { CodegenConfig } from '@graphql-codegen/cli';
import { Types } from '@graphql-codegen/plugin-helpers';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [process.env.VITE_GraphQLAPI ?? ""]: <Types.UrlSchemaWithOptions>{
        headers: {
          "x-api-key": process.env.GraphQLAPIKey,
        },
      }
    },
  ],
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
