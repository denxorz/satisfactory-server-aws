import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import vuetify from 'vite-plugin-vuetify'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify(), eslint()],
  define: { 'process.env': {}, global: {} },
})
