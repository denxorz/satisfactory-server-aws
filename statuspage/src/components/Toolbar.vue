<script setup lang="ts">
  import ctorImg from '../assets/ctor.png'

  const logout = () => {
    window.localStorage.removeItem('satisfactory-auth')
    window.location.reload()
  }
</script>
<template>
  <v-app-bar>
    <template #prepend>
      <v-img
        :src="ctorImg"
        alt="constructor"
        class="mr-4 ml-4"
        style="height: 40px; width: 40px"
      />
    </template>
    <v-app-bar-title>Satisfactory Server Status</v-app-bar-title>
    <div class="toolbar-actions">
      <v-btn
        variant="outlined"
        @click="logout"
        class="mr-4 action-btn"
        prepend-icon="mdi-logout"
      >
        Logout
      </v-btn>
    </div>
  </v-app-bar>
</template>

<style scoped>
  .toolbar-actions {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(229, 147, 69, 0.3);
  }
</style>
