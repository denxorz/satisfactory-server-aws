<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import CargoFlowChart from './components/CargoFlowChart.vue'
  import FactoryFilters from './components/FactoryFilters.vue'
  import FactoryPowerCircuitMap from './components/FactoryPowerCircuitMap.vue'
  import FactoryStabilityMap from './components/FactoryStabilityMap.vue'
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

  const activeTab = ref('stations')

  // Initialize tab from URL on mount
  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabFromUrl = urlParams.get('tab')
    if (tabFromUrl && ['stations', 'factories'].includes(tabFromUrl)) {
      activeTab.value = tabFromUrl
    }
  })

  // Watch for tab changes and update URL
  watch(activeTab, newTab => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', newTab)
    window.history.replaceState({}, '', url.toString())
  })
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
          <v-tabs
            v-model="activeTab"
            color="primary"
            class="mb-4"
            align-tabs="start"
          >
            <v-tab value="stations">
              <v-icon start>mdi-train</v-icon>
              Stations & Logistics
            </v-tab>
            <v-tab value="factories">
              <v-icon start>mdi-factory</v-icon>
              Factory Maps
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <v-window-item value="stations">
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
            </v-window-item>

            <v-window-item value="factories">
              <v-row>
                <v-col cols="12">
                  <FactoryFilters class="mb-4" />
                </v-col>
                <v-col cols="12" lg="6">
                  <FactoryStabilityMap class="fill-height" />
                </v-col>
                <v-col cols="12" lg="6">
                  <FactoryPowerCircuitMap class="fill-height" />
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-container>
      </v-main>
    </template>
  </v-app>
</template>
