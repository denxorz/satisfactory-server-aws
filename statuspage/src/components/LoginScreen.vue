<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  const emit = defineEmits<{
    authenticated: []
  }>()

  const password = ref('')
  const error = ref('')
  const isLoading = ref(false)
  const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'LizardDoggo'

  const checkStoredPassword = () => {
    const storedPassword = window.localStorage.getItem('satisfactory-auth')
    if (storedPassword === correctPassword) {
      emit('authenticated')
    }
  }

  const handleLogin = () => {
    isLoading.value = true
    error.value = ''

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (password.value === correctPassword) {
        window.localStorage.setItem('satisfactory-auth', password.value)
        emit('authenticated')
      } else {
        error.value = 'Incorrect password'
      }
      isLoading.value = false
    }, 300)
  }

  const handleKeyPress = (event: globalThis.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin()
    }
  }

  onMounted(() => {
    checkStoredPassword()
  })
</script>

<template>
  <div class="login-container">
    <v-card class="login-card">
      <v-card-title>Password required</v-card-title>
      <v-card-text class="login-content">
        <div class="login-form">
          <v-text-field
            v-model="password"
            type="password"
            label=""
            variant="outlined"
            :error-messages="error"
            @keypress="handleKeyPress"
            :disabled="isLoading"
            hide-details="auto"
          />

          <v-btn
            @click="handleLogin"
            :loading="isLoading"
            :disabled="!password.trim()"
            block
            class="login-btn"
            size="large"
            rounded="0"
          >
            <v-icon color="white">mdi-check-bold</v-icon>
            {{ isLoading ? 'Checking...' : 'Confirm' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .login-card {
    max-width: 400px;
    width: 100%;
  }

  .login-content {
    padding: 24px !important;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px 24px;
  }

  .login-btn .v-icon {
    color: #ffffff !important;
    margin-right: 8px !important;
  }

  .login-btn:disabled {
    background: #666666 !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .login-btn:disabled .v-icon {
    color: #ffffff !important;
  }
</style>
