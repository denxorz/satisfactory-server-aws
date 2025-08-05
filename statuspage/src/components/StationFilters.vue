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
    <v-card-title class="pb-2">Station Filters</v-card-title>
    <div class="pa-4 pt-0">
      <v-row dense class="mb-1">
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
            label="Cargo Type"
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

      <v-row dense>
        <!-- Station Type Filter -->
        <v-col cols="12" sm="6">
          <v-chip-group>
            <v-chip
              :color="
                stationsStore.filters.selectedStationTypes.includes('train')
                  ? 'success'
                  : 'default'
              "
              :variant="
                stationsStore.filters.selectedStationTypes.includes('train')
                  ? 'elevated'
                  : 'outlined'
              "
              size="small"
              @click="debouncedToggleStationType('train')"
            >
              <v-icon start>mdi-train</v-icon>
              Train Stations
            </v-chip>
            <v-chip
              :color="
                stationsStore.filters.selectedStationTypes.includes('truck')
                  ? 'warning'
                  : 'default'
              "
              :variant="
                stationsStore.filters.selectedStationTypes.includes('truck')
                  ? 'elevated'
                  : 'outlined'
              "
              size="small"
              @click="debouncedToggleStationType('truck')"
            >
              <v-icon start>mdi-truck</v-icon>
              Truck Stations
            </v-chip>
            <v-chip
              :color="
                stationsStore.filters.selectedStationTypes.includes('drone')
                  ? 'primary'
                  : 'default'
              "
              :variant="
                stationsStore.filters.selectedStationTypes.includes('drone')
                  ? 'elevated'
                  : 'outlined'
              "
              size="small"
              @click="debouncedToggleStationType('drone')"
            >
              <v-icon start>mdi-quadcopter</v-icon>
              Drone Stations
            </v-chip>
          </v-chip-group>
        </v-col>

        <!-- Transfer Type Filter -->
        <v-col cols="12" sm="6">
          <v-chip-group>
            <v-chip
              :color="
                stationsStore.filters.selectedTransferTypes.includes('load')
                  ? 'info'
                  : 'default'
              "
              :variant="
                stationsStore.filters.selectedTransferTypes.includes('load')
                  ? 'elevated'
                  : 'outlined'
              "
              size="small"
              @click="debouncedToggleTransferType('load')"
            >
              <v-icon start>mdi-tray-arrow-down</v-icon>
              Load
            </v-chip>
            <v-chip
              :color="
                stationsStore.filters.selectedTransferTypes.includes('unload')
                  ? 'warning'
                  : 'default'
              "
              :variant="
                stationsStore.filters.selectedTransferTypes.includes('unload')
                  ? 'elevated'
                  : 'outlined'
              "
              size="small"
              @click="debouncedToggleTransferType('unload')"
            >
              <v-icon start>mdi-tray-arrow-up</v-icon>
              Unload
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>
