import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// @ts-expect-error See https://github.com/gxmari007/vite-plugin-eslint/issues/79
import eslint from 'vite-plugin-eslint'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify(), eslint()],

  define: { 'process.env': {}, global: {} },
})
