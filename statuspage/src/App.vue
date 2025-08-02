<script setup lang="ts">
  import { useQuery } from '@vue/apollo-composable'
  import { computed } from 'vue'

  import CargoFlowChart from './components/CargoFlowChart.vue'
  import StationGraph from './components/StationGraph.vue'
  import StationsTable from './components/StationsTable.vue'

  import Toolbar from './components/Toolbar.vue'
  import { graphql } from './gql'
  import type { Station } from './gql/graphql'

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
    `)
  )

  const stations = computed(() => {
    const stationsData =
      (resultSaveDetails.value?.saveDetails?.stations as
        | (Station | null)[]
        | undefined) ?? []
    return stationsData.filter((s): s is Station => !!s)
  })
</script>

<template>
  <v-app>
    <Toolbar />
    <v-main>
      <v-container class="pa-8" fluid>
        <v-row>
          <v-col cols="12">
            <CargoFlowChart :stations="stations" />
          </v-col>

          <v-col cols="6">
            <StationGraph :stations="stations" />
          </v-col>
          <v-col cols="6">
            <StationsTable :stations="stations" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
