<script setup lang="ts">
  import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
  import { computed, ref, watch } from 'vue'

  import { graphql } from '../gql'

  interface Props {
    serverStatus: string
    serverProbeData: any
  }

  const props = defineProps<Props>()

  useSubscription(
    graphql(`
      subscription statusChanged {
        statusChanged {
          id
          status
          previousStatus
          detail
        }
      }
    `)
  )

  const { mutate: start } = useMutation(
    graphql(`
      mutation start {
        start {
          status
          previousStatus
          detail
        }
      }
    `)
  )

  const lastSaveEnabled = ref(false)
  const { result: resultLastSave } = useQuery(
    graphql(`
      query lastSave {
        lastSave {
          url
        }
      }
    `),
    null,
    { enabled: lastSaveEnabled }
  )

  watch(resultLastSave, nv => {
    if (nv?.lastSave) {
      window.open(nv.lastSave?.url ?? '')
      lastSaveEnabled.value = false
    }
  })

  const lastLogEnabled = ref(false)
  const { result: resultLastLog } = useQuery(
    graphql(`
      query lastLog {
        lastLog {
          url
        }
      }
    `),
    null,
    { enabled: lastLogEnabled }
  )

  watch(resultLastLog, nv => {
    if (nv?.lastLog) {
      window.open(nv.lastLog?.url ?? '')
      lastLogEnabled.value = false
    }
  })

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

  const status = computed(() => props.serverStatus)

  const statusClass = computed(() => {
    switch (status.value) {
      case 'running':
        return 'status-running'
      case 'stopped':
        return 'status-stopped'
      case 'starting':
        return 'status-starting'
      default:
        return 'status-unknown'
    }
  })

  const statusToShow = computed(() => {
    if (status.value === 'running') {
      if (props.serverProbeData?.success) {
        return props.serverProbeData.serverState
      }
      return 'Starting...'
    }
    return status.value
  })

  const startRes = ref()

  const startServer = async () => {
    startRes.value = await start()
  }

  const downloadSave = async () => {
    lastSaveEnabled.value = true
  }

  const downloadLog = async () => {
    lastLogEnabled.value = true
  }
</script>

<template>
  <v-card>
    <v-card-title>Dedicated Server</v-card-title>
    <v-card-text>
      <v-row class="ma-1" dense>
        <v-col cols="3">
          <strong>Status:</strong>
        </v-col>
        <v-col cols="9">
          <span class="status-value" :class="statusClass">{{ statusToShow }}</span>
        </v-col>
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
      <v-row class="ma-1 mt-4">
        <v-col cols="12">
          <div class="server-actions">
            <v-btn
              variant="outlined"
              @click="startServer"
              class="mr-4 action-btn"
              prepend-icon="mdi-play-box"
            >
              Start
            </v-btn>
            <v-btn
              variant="outlined"
              @click="downloadSave"
              class="mr-4 action-btn"
              prepend-icon="mdi-file-download"
            >
              Save
            </v-btn>
            <v-btn
              variant="outlined"
              @click="downloadLog"
              class="mr-4 action-btn"
              prepend-icon="mdi-file-download"
            >
              Log
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
  .status-value {
    font-weight: 500;
  }

  .status-running {
    color: #4caf50 !important;
  }

  .status-stopped {
    color: #f44336 !important;
  }

  .status-starting {
    color: #ffc107 !important;
  }

  .status-unknown {
    color: #9e9e9e !important;
  }

  .server-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(229, 147, 69, 0.3);
  }
</style>
