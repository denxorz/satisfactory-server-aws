import { ref } from 'vue'

export function useAuthentication() {
  const isAuthenticated = ref(false)

  const handleAuthenticated = () => {
    isAuthenticated.value = true
  }

  return {
    isAuthenticated,
    handleAuthenticated,
  }
}
