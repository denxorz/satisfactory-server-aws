<script setup lang="ts">
  import { useQuery } from '@vue/apollo-composable'
  import { computed, ref, watch } from 'vue'

  import CargoFlowChart from './components/CargoFlowChart.vue'
  import LoginScreen from './components/LoginScreen.vue'
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
</script>

<template>
  <v-app>
    <div v-if="!isAuthenticated" class="satisfactory-theme">
      <LoginScreen @authenticated="handleAuthenticated" />
    </div>
    <template v-else>
      <Toolbar />
      <v-main class="satisfactory-theme">
        <v-container class="pa-4" fluid>
          <v-row>
            <v-col cols="12">
              <StationFilters />
            </v-col>
            <v-col cols="12">
              <CargoFlowChart />
            </v-col>

            <v-col cols="6">
              <StationGraph />
            </v-col>
            <v-col cols="6">
              <StationsTable />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </template>
  </v-app>
</template>
