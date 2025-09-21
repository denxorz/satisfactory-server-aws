<script setup lang="ts">
  import { useStationsStore } from '../stores/stations'

  const stationsStore = useStationsStore()

  function debounce<T extends (...args: never[]) => unknown>(
    func: T,
    delay: number = 150
  ): T {
    let timeoutId: number
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }) as T
  }

  const debouncedUpdateSearchText = debounce((searchText: string) =>
    stationsStore.updateSearchText(searchText)
  )
  const debouncedUpdateSelectedCargoTypes = debounce((cargoTypes: string[]) =>
    stationsStore.updateSelectedCargoTypes(cargoTypes)
  )
  const debouncedToggleStationType = debounce((stationType: string) =>
    stationsStore.toggleStationType(stationType)
  )
  const debouncedToggleTransferType = debounce((transferType: string) =>
    stationsStore.toggleTransferType(transferType)
  )
</script>

<template>
  <v-card>
    <v-card-title>Station Filters</v-card-title>
    <div class="pa-6 pt-0">
      <v-row dense class="mb-4">
        <!-- Search -->
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="stationsStore.filters.searchText"
            @update:model-value="debouncedUpdateSearchText"
            label="Search Stations"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>

        <!-- Cargo Type Filter -->
        <v-col cols="12" sm="6">
          <v-autocomplete
            :model-value="stationsStore.filters.selectedCargoTypes"
            @update:model-value="debouncedUpdateSelectedCargoTypes"
            :items="stationsStore.cargoTypeOptions"
            label="Type"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-package-variant"
            chips
            closable-chips
            hide-details
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-2">
        <!-- Transfer Type Filter -->
        <v-col cols="12" sm="6">
          <v-chip-group class="gap-2">
            <v-chip
              :class="
                stationsStore.filters.selectedTransferTypes.length === 0 ||
                stationsStore.filters.selectedTransferTypes.includes('load')
                  ? 'filter-chip-active'
                  : ''
              "
              size="small"
              @click="debouncedToggleTransferType('load')"
            >
              <v-icon start>mdi-tray-arrow-down</v-icon>
              Load
            </v-chip>
            <v-chip
              :class="
                stationsStore.filters.selectedTransferTypes.length === 0 ||
                stationsStore.filters.selectedTransferTypes.includes('unload')
                  ? 'filter-chip-active'
                  : ''
              "
              size="small"
              @click="debouncedToggleTransferType('unload')"
            >
              <v-icon start>mdi-tray-arrow-up</v-icon>
              Unload
            </v-chip>
          </v-chip-group>
        </v-col>

        <!-- Station Type Filter -->
        <v-col cols="12" sm="6">
          <v-chip-group class="gap-2">
            <v-chip
              :class="
                stationsStore.filters.selectedStationTypes.length === 0 ||
                stationsStore.filters.selectedStationTypes.includes('train')
                  ? 'filter-chip-active'
                  : ''
              "
              size="small"
              @click="debouncedToggleStationType('train')"
            >
              <v-icon start>mdi-train</v-icon>
              Trains
            </v-chip>
            <v-chip
              :class="
                stationsStore.filters.selectedStationTypes.length === 0 ||
                stationsStore.filters.selectedStationTypes.includes('truck')
                  ? 'filter-chip-active'
                  : ''
              "
              size="small"
              @click="debouncedToggleStationType('truck')"
            >
              <v-icon start>mdi-truck</v-icon>
              Trucks
            </v-chip>
            <v-chip
              :class="
                stationsStore.filters.selectedStationTypes.length === 0 ||
                stationsStore.filters.selectedStationTypes.includes('drone')
                  ? 'filter-chip-active'
                  : ''
              "
              size="small"
              @click="debouncedToggleStationType('drone')"
            >
              <v-icon start>mdi-quadcopter</v-icon>
              Drones
            </v-chip>
            <v-chip
              :class="
                stationsStore.filters.showUploaders ? 'filter-chip-active' : ''
              "
              size="small"
              @click="stationsStore.toggleShowUploaders()"
            >
              <v-icon start>mdi-upload</v-icon>
              Uploader
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>
