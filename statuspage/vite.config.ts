import eslint from '@nabla/vite-plugin-eslint'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify(), eslint()],

  define: { 'process.env': {}, global: {} },
})
