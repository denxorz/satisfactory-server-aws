<script setup lang="ts">
  import { ref } from 'vue'
  import ctorImg from '../assets/ctor.png'
  import ParsingDetailsDialog from './ParsingDetailsDialog.vue'

  const showParsingDialog = ref(false)

  const logout = () => {
    window.localStorage.removeItem('satisfactory-auth')
    window.location.reload()
  }

  const openParsingDialog = () => {
    showParsingDialog.value = true
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
      <v-menu>
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props" class="mr-4 action-btn" icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            @click="openParsingDialog"
            prepend-icon="mdi-file-cog"
            title="Parsing Details"
          />
          <v-list-item @click="logout" prepend-icon="mdi-logout" title="Logout" />
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <ParsingDetailsDialog v-model="showParsingDialog" />
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

  .action-btn {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }

  .action-btn:focus {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
</style>
