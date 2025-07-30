import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import eslint from 'vite-plugin-eslint'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify(), eslint()],
  define: { 'process.env': {}, global: {} },
})
