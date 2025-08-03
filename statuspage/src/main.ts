import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { AUTH_TYPE, createAuthLink, type AuthOptions } from 'aws-appsync-auth-link'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { createVuetify } from 'vuetify'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/lib/styles/main.css'

import App from './App.vue'

const url = import.meta.env.VITE_GraphQLAPI
const region = import.meta.env.VITE_GraphQLAPIKey
const auth: AuthOptions = {
  type: AUTH_TYPE.API_KEY,
  apiKey: import.meta.env.VITE_GraphQLAPIKey,
  // jwtToken: async () => token, // Required when you use Cognito UserPools OR OpenID Connect. token object is obtained previously
  // credentials: async () => credentials, // Required when you use IAM-based auth.
}

const httpLink = new HttpLink({ uri: url })

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth }, httpLink),
])

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

const vuetify = createVuetify({
  theme: {
    defaultTheme: prefersDark ? 'dark' : 'light',
  },
})

const app = createApp(App)
app.use(vuetify)
app.use(createPinia())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(VueApexCharts as any)
app.provide(DefaultApolloClient, apolloClient)

app.mount('#app')
