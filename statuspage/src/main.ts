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

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#e59345',
          secondary: '#e59345',
          surface: '#212121',
          background: '#212121',
          'on-surface': '#e59345',
          'on-background': '#e59345',
          'on-primary': '#202020',
          'on-secondary': '#202020',
          border: '#e59345',
          'on-border': '#202020',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(vuetify)
app.use(createPinia())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(VueApexCharts as any)
app.provide(DefaultApolloClient, apolloClient)

app.mount('#app')
