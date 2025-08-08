<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    serverStatus: string
    serverProbeData: any
  }

  const props = defineProps<Props>()

  const serverInfo = computed(() => {
    if (props.serverProbeData?.success) {
      return {
        name: props.serverProbeData.serverName,
        version: props.serverProbeData.serverVersion,
      }
    }
    return {
      name: 'unknown',
      version: 'unknown',
    }
  })
</script>

<template>
  <v-card>
    <v-card-title>Dedicated Server</v-card-title>
    <v-card-text>
      <v-row class="ma-1">
        <v-col cols="3">
          <strong>Name:</strong>
        </v-col>
        <v-col cols="9">
          <span>{{ serverInfo.name }}</span>
        </v-col>
        <v-col cols="3">
          <strong>Version:</strong>
        </v-col>
        <v-col cols="9">
          <span>{{ serverInfo.version }}</span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
