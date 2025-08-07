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
import './styles/global.css'

// Buffer is required for graphql subscriptions with appsync
import buffer from 'buffer'
declare global {
  interface Window {
    Buffer: typeof buffer.Buffer
  }
}
window.Buffer = buffer.Buffer

import App from './App.vue'

const url = import.meta.env.VITE_GraphQLAPI
const region = import.meta.env.VITE_GraphQLAPIRegion
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
  defaults: {
    global: {
      ripple: false,
    },
    VCard: {
      style: {
        background: 'rgb(var(--v-theme-surface))',
        border: '4px solid rgb(var(--v-theme-primary))',
        borderRadius: '0',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(229, 147, 69, 0.1)',
      },
    },
    VCardTitle: {
      style: {
        background: 'rgb(var(--v-theme-primary))',
        color: 'rgb(var(--v-theme-on-primary))',
        padding: '8px 8px 2px 8px',
        margin: '-8px -8px 10px -4px',
        borderRadius: '0',
        textAlign: 'left',
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        fontWeight: '550',
        letterSpacing: '2px',
      },
    },
    VCardText: {
      style: {
        padding: '0',
      },
    },
    VBtn: {
      elevation: 4,
      style: {
        background: 'rgba(33, 33, 33, 0.8)',
        border: '1px solid rgb(var(--v-theme-primary))',
        color: '#ffffff',
      },
    },
    VChip: {
      style: {
        background: '#666666',
        border: '1px solid #666666',
        color: '#ffffff',
      },
    },
    VTextField: {
      style: {
        background: 'rgba(33, 33, 33, 0.8)',
        border: '1px solid rgb(var(--v-theme-primary))',
        borderRadius: '6px',
      },
    },
    VSelect: {
      style: {
        background: 'rgba(33, 33, 33, 0.8)',
        border: '1px solid rgb(var(--v-theme-primary))',
        borderRadius: '6px',
      },
    },
    VAlert: {
      style: {
        background: 'rgba(33, 33, 33, 0.8)',
        border: '1px solid rgb(var(--v-theme-primary))',
        color: 'rgb(var(--v-theme-primary))',
      },
    },
    VProgressCircular: {
      style: {
        color: 'rgb(var(--v-theme-primary))',
      },
    },
    VIcon: {
      style: {
        color: 'rgb(var(--v-theme-primary))',
      },
    },
    VToolbar: {
      style: {
        background: 'rgba(33, 33, 33, 0.9)',
        borderBottom: '1px solid rgb(var(--v-theme-primary))',
      },
    },
    VBottomSheet: {
      style: {
        background: 'rgba(33, 33, 33, 0.95)',
        borderTop: '2px solid rgb(var(--v-theme-primary))',
      },
    },
  },
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
