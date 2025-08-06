<script setup lang="ts">
  import { useQuery } from '@vue/apollo-composable'
  import { computed, watch } from 'vue'

  import CargoFlowChart from './components/CargoFlowChart.vue'
  import StationFilters from './components/StationFilters.vue'
  import StationGraph from './components/StationGraph.vue'
  import StationsTable from './components/StationsTable.vue'

  import Toolbar from './components/Toolbar.vue'
  import { graphql } from './gql'
  import type { Station } from './gql/graphql'
  import { useStationsStore } from './stores/stations'

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
</script>

<template>
  <v-app>
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
  </v-app>
</template>

<style scoped>
  .satisfactory-theme {
    background: rgb(var(--v-theme-background));
    min-height: 100vh;
    font-family: 'Open Sans', sans-serif;
    font-weight: 600;
  }

  .satisfactory-theme :deep(.v-card) {
    background: rgb(var(--v-theme-surface)) !important;
    border: 4px solid rgb(var(--v-theme-primary)) !important;
    border-radius: 0 !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(229, 147, 69, 0.1) !important;
  }

  .satisfactory-theme :deep(.v-card-title) {
    background: rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
    padding: 8px 8px 2px 8px !important;
    margin: -8px -8px 10px -4px !important;
    border-radius: 0 !important;
    text-align: left !important;
    text-transform: uppercase !important;
    font-size: 0.9rem !important;
    font-weight: 550 !important;
  }

  .satisfactory-theme :deep(.v-card-text) {
    padding: 0 !important;
  }

  .satisfactory-theme :deep(.v-btn) {
    background: rgba(33, 33, 33, 0.8) !important;
    border: 1px solid rgb(var(--v-theme-primary)) !important;
    color: #ffffff !important;
    border-radius: 20px !important;
  }

  .satisfactory-theme :deep(.v-btn:hover) {
    background: rgba(229, 147, 69, 0.2) !important;
  }

  .satisfactory-theme :deep(.v-chip) {
    background: rgba(229, 147, 69, 0.2) !important;
    border: 1px solid rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }

  .satisfactory-theme :deep(.v-text-field) {
    background: rgba(33, 33, 33, 0.8) !important;
    border: 1px solid rgb(var(--v-theme-primary)) !important;
    border-radius: 6px !important;
  }

  .satisfactory-theme :deep(.v-select) {
    background: rgba(33, 33, 33, 0.8) !important;
    border: 1px solid rgb(var(--v-theme-primary)) !important;
    border-radius: 6px !important;
  }

  .satisfactory-theme :deep(.v-alert) {
    background: rgba(33, 33, 33, 0.8) !important;
    border: 1px solid rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }

  .satisfactory-theme :deep(.v-progress-circular) {
    color: rgb(var(--v-theme-primary)) !important;
  }

  .satisfactory-theme :deep(.v-icon) {
    color: rgb(var(--v-theme-primary)) !important;
  }

  .satisfactory-theme :deep(.v-toolbar) {
    background: rgba(33, 33, 33, 0.9) !important;
    border-bottom: 1px solid rgb(var(--v-theme-primary)) !important;
  }

  .satisfactory-theme :deep(.v-bottom-sheet) {
    background: rgba(33, 33, 33, 0.95) !important;
    border-top: 2px solid rgb(var(--v-theme-primary)) !important;
  }
</style>
