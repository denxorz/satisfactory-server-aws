import { createApp } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client/core'
import { AUTH_TYPE, createAuthLink, type AuthOptions } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue'

const url = import.meta.env.VITE_GraphQLAPI;
const region = import.meta.env.VITE_GraphQLAPIKey;
const auth: AuthOptions = {
  type: AUTH_TYPE.API_KEY,
  apiKey: import.meta.env.VITE_GraphQLAPIKey,
  // jwtToken: async () => token, // Required when you use Cognito UserPools OR OpenID Connect. token object is obtained previously
  // credentials: async () => credentials, // Required when you use IAM-based auth.
};

const httpLink = new HttpLink({ uri: url });

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth }, httpLink),
]);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const vuetify = createVuetify();

const app = createApp(App);
app.use(vuetify);
app.provide(DefaultApolloClient, apolloClient)

app.mount('#app')
