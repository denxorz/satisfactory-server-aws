<script setup lang="ts">
  import { computed } from 'vue'

  import type { Station } from '../gql/graphql'
  import { useStationsStore } from '../stores/stations'

  interface Props {
    stations: Station[]
  }

  const props = defineProps<Props>()
  const stationsStore = useStationsStore()

  const stations = computed(() => props.stations)
</script>

<template>
  <v-card>
    <v-card-title>Station Filters</v-card-title>
    <v-card-text>
      <v-row dense>
        <!-- Search -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="stationsStore.filters.searchText"
            @update:model-value="stationsStore.updateSearchText"
            label="Search Stations"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            variant="outlined"
          />
        </v-col>

        <!-- Station Type Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="stationsStore.filters.selectedStationTypes"
            @update:model-value="stationsStore.updateSelectedStationTypes"
            :items="stationsStore.stationTypeOptions"
            label="Station Type"
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-train"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon>{{ item.raw.prependIcon }}</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <!-- Transfer Type Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="stationsStore.filters.selectedTransferTypes"
            @update:model-value="stationsStore.updateSelectedTransferTypes"
            :items="stationsStore.transferTypeOptions"
            label="Transfer Type"
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-tray-arrow-up"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon>{{ item.raw.prependIcon }}</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <!-- Cargo Type Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-autocomplete
            :model-value="stationsStore.filters.selectedCargoTypes"
            @update:model-value="stationsStore.updateSelectedCargoTypes"
            :items="stationsStore.cargoTypeOptions"
            label="Cargo Type"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-package-variant"
            chips
            closable-chips
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
