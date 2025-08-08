<script setup lang="ts">
  import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
  import { computed, ref, watch } from 'vue'

  import ctorImg from '../assets/ctor.png'
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

  const startRes = ref()
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

  const startServer = async () => {
    startRes.value = await start()
  }

  const downloadSave = async () => {
    lastSaveEnabled.value = true
  }

  const downloadLog = async () => {
    lastLogEnabled.value = true
  }

  const logout = () => {
    window.localStorage.removeItem('satisfactory-auth')
    window.location.reload()
  }

  const statusToShow = computed(() => {
    if (status.value === 'running') {
      if (props.serverProbeData?.success) {
        return props.serverProbeData.serverState
      }
      return 'Starting...'
    }
    return status.value
  })
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
    <div class="status-indicators">
      <div class="status-item">
        <strong class="status-label">Status:</strong>
        <span class="status-value" :class="statusClass">{{ statusToShow }}</span>
      </div>
    </div>
    <div class="toolbar-actions">
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
  .status-indicators {
    display: flex;
    gap: 24px;
    margin-left: 24px;
    margin-right: 24px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-label {
    color: #e59345 !important;
    font-weight: 600 !important;
  }

  .status-value {
    color: #e59345 !important;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 500;
    background: rgba(229, 147, 69, 0.1);
    border: 1px solid rgba(229, 147, 69, 0.3);
  }

  .status-running {
    background: rgba(76, 175, 80, 0.2) !important;
    border-color: #4caf50 !important;
    color: #4caf50 !important;
  }

  .status-stopped {
    background: rgba(244, 67, 54, 0.2) !important;
    border-color: #f44336 !important;
    color: #f44336 !important;
  }

  .status-starting {
    background: rgba(255, 193, 7, 0.2) !important;
    border-color: #ffc107 !important;
    color: #ffc107 !important;
  }

  .status-unknown {
    background: rgba(158, 158, 158, 0.2) !important;
    border-color: #9e9e9e !important;
    color: #9e9e9e !important;
  }

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
