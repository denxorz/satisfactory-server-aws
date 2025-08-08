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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stations } = useStationsData()
</script>

<template>
  <v-app>
    <div v-if="!isAuthenticated" class="satisfactory-theme">
      <LoginScreen @authenticated="handleAuthenticated" />
    </div>
    <template v-else>
      <Toolbar :server-status="serverStatus" :server-probe-data="serverProbeData" />
      <v-main class="satisfactory-theme">
        <v-container class="pa-4" fluid>
          <v-row>
            <v-col cols="8">
              <StationFilters class="h-100" />
            </v-col>
            <v-col cols="4">
              <ServerInfo
                :server-status="serverStatus"
                :server-probe-data="serverProbeData"
                class="h-100"
              />
            </v-col>
            <v-col cols="12">
              <CargoFlowChart />
            </v-col>

            <v-col cols="6">
              <StationGraph class="h-100" />
            </v-col>
            <v-col cols="6">
              <StationsTable class="h-100" />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </template>
  </v-app>
</template>

<style scoped>
  .h-100 {
    height: 100%;
  }

  /* Ensure cards in the same row have equal heights */
  .v-row > .v-col {
    display: flex;
    flex-direction: column;
  }

  /* Make the v-card take full height */
  .v-row > .v-col > .v-card {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Ensure v-card-text takes remaining space */
  .v-row > .v-col > .v-card > .v-card-text {
    flex: 1;
  }
</style>
