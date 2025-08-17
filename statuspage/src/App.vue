<script setup lang="ts">
  import CargoFlowChart from './components/CargoFlowChart.vue'
  import LoginScreen from './components/LoginScreen.vue'
  import ServerInfo from './components/ServerInfo.vue'
  import StationFilters from './components/StationFilters.vue'
  import StationGraph from './components/StationGraph.vue'
  import StationsTable from './components/StationsTable.vue'

  import Toolbar from './components/Toolbar.vue'
  import { useAuthentication } from './composables/useAuthentication'
  import { useServerStatus } from './composables/useServerStatus'
  import { useStationsData } from './composables/useStationsData'

  const { isAuthenticated, handleAuthenticated } = useAuthentication()
  const { serverStatus, serverProbeData } = useServerStatus()
  useStationsData()
</script>

<template>
  <v-app>
    <div v-if="!isAuthenticated" class="satisfactory-theme">
      <LoginScreen @authenticated="handleAuthenticated" />
    </div>
    <template v-else>
      <Toolbar />
      <v-main class="satisfactory-theme">
        <v-container class="pa-4" max-width="1400">
          <v-row>
            <v-col cols="12" md="8">
              <StationFilters class="fill-height" />
            </v-col>
            <v-col cols="12" md="4">
              <ServerInfo
                :server-status="serverStatus"
                :server-probe-data="serverProbeData"
                class="fill-height"
              />
            </v-col>
            <v-col cols="12">
              <CargoFlowChart />
            </v-col>

            <v-col cols="12" lg="6">
              <StationGraph class="fill-height" />
            </v-col>
            <v-col cols="12" lg="6">
              <StationsTable class="fill-height" />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </template>
  </v-app>
</template>
