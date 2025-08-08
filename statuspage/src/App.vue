<script setup lang="ts">
  import { useQuery, useSubscription } from '@vue/apollo-composable'
  import { computed, ref, watch } from 'vue'

  import CargoFlowChart from './components/CargoFlowChart.vue'
  import LoginScreen from './components/LoginScreen.vue'
  import ServerInfo from './components/ServerInfo.vue'
  import StationFilters from './components/StationFilters.vue'
  import StationGraph from './components/StationGraph.vue'
  import StationsTable from './components/StationsTable.vue'

  import Toolbar from './components/Toolbar.vue'
  import { graphql } from './gql'
  import type { Station } from './gql/graphql'
  import { useStationsStore } from './stores/stations'

  const isAuthenticated = ref(false)

  const stationsStore = useStationsStore()

  const shouldSkipQuery = computed(
    () => stationsStore.stations.length > 0 && !stationsStore.isDataStale()
  )

  const { result: resultSaveDetails } = useQuery(
    graphql(`
      query saveDetails {
        saveDetails {
          stations {
            cargoTypes
            cargoFlows {
              type
              isUnload
              flowPerMinute
              isExact
            }
            id
            isUnload
            name
            type
            transporters {
              id
              from
              to
            }
            x
            y
          }
        }
      }
    `),
    undefined,
    () => ({
      enabled: !shouldSkipQuery.value,
    })
  )

  const stations = computed(() => {
    const stationsData = resultSaveDetails.value?.saveDetails?.stations ?? []
    return stationsData.filter((s): s is Station => !!s)
  })

  watch(
    stations,
    newStations => {
      stationsStore.setStations(newStations)
    },
    { immediate: true }
  )

  const handleAuthenticated = () => {
    isAuthenticated.value = true
  }

  const { result: statusResult } = useQuery(
    graphql(`
      query status {
        status(id: "last") {
          id
          status
          previousStatus
          detail
        }
      }
    `)
  )

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

  const status = computed(() => statusResult.value?.status?.status ?? 'stopped')
  const shouldPollGameServer = computed(() => status.value !== 'stopped')

  const { result: gameServerProbeResult } = useQuery(
    graphql(`
      query gameServerProbe($host: String, $port: Int) {
        gameServerProbe(host: $host, port: $port) {
          success
          error
          serverState
          serverVersion
          serverName
        }
      }
    `),
    () => ({
      host: import.meta.env.VITE_SatisfactoryDNS,
      port: 7777,
    }),
    {
      enabled: shouldPollGameServer,
      pollInterval: 15000,
    }
  )

  const serverStatus = computed(() => status.value)
  const serverProbeData = computed(
    () => gameServerProbeResult.value?.gameServerProbe
  )
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

  .v-row > .v-col > * {
    flex: 1;
  }
</style>
