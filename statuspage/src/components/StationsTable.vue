<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useTheme } from 'vuetify'

  import type { Maybe, Station } from '../gql/graphql'
  import StationDetails from './StationDetails.vue'

  interface Props {
    stations: Station[]
  }

  const props = defineProps<Props>()

  const stations = computed(() => props.stations)

  // Filter state - keeping complex filters that v-data-table can't handle
  const searchText = ref('')
  const selectedStationTypes = ref<string | undefined>(undefined)
  const selectedTransferTypes = ref<string | undefined>(undefined)
  const selectedCargoTypes = ref<string[]>([])

  // Available filter options
  const stationTypeOptions = computed(() => {
    const types = new Set(stations.value.map(s => s.type).filter(Boolean))
    return Array.from(types).map(type => ({
      title: (type && type.charAt(0).toUpperCase() + type.slice(1)) || 'Unknown',
      value: type || 'unknown',
      prependIcon: icon(type),
    }))
  })

  const transferTypeOptions = [
    { title: 'Load', value: 'load', prependIcon: 'mdi-tray-arrow-down' },
    { title: 'Unload', value: 'unload', prependIcon: 'mdi-tray-arrow-up' },
  ]

  const cargoTypeOptions = computed(() => {
    const cargoTypes = new Set<string>()
    stations.value.forEach(station => {
      station.cargoTypes?.forEach(type => {
        if (type) cargoTypes.add(type)
      })
    })
    return Array.from(cargoTypes)
      .sort()
      .map(type => ({
        title: type,
        value: type,
      }))
  })

  // Pre-filtered stations for complex filters that v-data-table can't handle
  const preFilteredStations = computed(() => {
    return stations.value.filter(station => {
      // Text search
      if (
        searchText.value &&
        !station.name?.toLowerCase().includes(searchText.value.toLowerCase())
      ) {
        return false
      }

      // Station type filter
      if (
        selectedStationTypes.value &&
        selectedStationTypes.value !== (station.type || 'unknown')
      ) {
        return false
      }

      // Transfer type filter
      if (selectedTransferTypes.value) {
        const isUnload = station.isUnload
        const transferType = isUnload ? 'unload' : 'load'
        if (selectedTransferTypes.value !== transferType) {
          return false
        }
      }

      // Cargo type filter
      if (selectedCargoTypes.value.length > 0) {
        const stationCargoTypes = station.cargoTypes || []
        const hasMatchingCargo = selectedCargoTypes.value.some(selectedType =>
          stationCargoTypes.includes(selectedType)
        )
        if (!hasMatchingCargo) {
          return false
        }
      }

      return true
    })
  })

  const selectedStations = ref<string[]>([])
  const selectedStation = computed(() =>
    preFilteredStations.value.find(s => s.id === selectedStations.value[0])
  )
  const showStationDetails = ref(false)

  // Show bottom sheet when a station is selected
  watch(selectedStation, newStation => {
    showStationDetails.value = !!newStation
  })

  // Clear selection when bottom sheet is closed
  const closeStationDetails = () => {
    showStationDetails.value = false
    selectedStations.value = []
  }

  const theme = useTheme()

  function rowProps({ internalItem }: { internalItem: { value: string } }) {
    const isDark = theme.global.current.value.dark
    if (internalItem.value && selectedStations.value.includes(internalItem.value)) {
      return {
        style: isDark
          ? 'background-color: #374151 !important; color: #fff;'
          : 'background-color: #e3f2fd !important;',
      }
    }
    return {}
  }

  const icon = (type?: Maybe<string>) => {
    if (type === 'train') return 'mdi-train'
    if (type === 'truck') return 'mdi-truck'
    if (type === 'drone') return 'mdi-quadcopter'
    return 'mdi-help-box'
  }
</script>

<template>
  <v-card>
    <v-card-title>Stations</v-card-title>
    <v-card-text>
      <v-data-table
        :headers="[
          { title: '', key: 'type', width: '48px' },
          {
            title: '',
            key: 'transfer',
            width: '48px',
            sortRaw: (a: Station, b: Station) =>
              (a.isUnload ? 1 : 0) - (b.isUnload ? 1 : 0),
          },
          { title: 'Station', key: 'name', width: '40%' },
          {
            title: 'Cargo',
            key: 'cargoFlows',
            sortRaw: (a: Station, b: Station) =>
              (
                a.cargoFlows?.map(c => c?.type)?.join('/') || 'Unknown'
              ).localeCompare(
                b.cargoFlows?.map(c => c?.type)?.join('/') || 'Unknown'
              ),
          },
          { title: 'Vehicles', key: 'transporters' },
        ]"
        :items="preFilteredStations"
        item-key="id"
        class="elevation-1 mt-4"
        hide-footer
        :items-per-page="15"
        v-model="selectedStations"
        select-strategy="single"
        @click:row="
          (
            _: unknown,
            {
              internalItem,
              toggleSelect,
            }: { internalItem: Station; toggleSelect: (item: Station) => void }
          ) => toggleSelect(internalItem)
        "
        :row-props="rowProps"
        :sort-by="[{ key: 'name', order: 'asc' }]"
      >
        <!-- Filters Section -->
        <template v-slot:top>
          <v-row dense class="mt-1 ml-1 mr-1">
            <!-- Search -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="searchText"
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
                v-model="selectedStationTypes"
                :items="stationTypeOptions"
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
                v-model="selectedTransferTypes"
                :items="transferTypeOptions"
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
                v-model="selectedCargoTypes"
                :items="cargoTypeOptions"
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
        </template>
        <template v-slot:item.type="{ item }">
          <v-icon>
            {{ icon(item?.type) }}
          </v-icon>
        </template>
        <template v-slot:item.transfer="{ item }">
          <v-icon>
            {{ item?.isUnload ? 'mdi-tray-arrow-up' : 'mdi-tray-arrow-down' }}
          </v-icon>
        </template>
        <template v-slot:item.cargoFlows="{ item }">
          {{
            item?.cargoFlows
              ?.map(c => `${c?.flowPerMinute ?? '??'} ${c?.type}`)
              ?.join(' / ') || 'Unknown'
          }}
        </template>
        <template v-slot:item.transporters="{ item }">
          {{ item?.transporters?.length || 0 }}
        </template>
      </v-data-table>

      <v-bottom-sheet v-model="showStationDetails" :retain-focus="false" inset>
        <StationDetails :station="selectedStation" :on-close="closeStationDetails" />
      </v-bottom-sheet>

      <div v-if="!props.stations.length" class="text-center pa-8">
        <v-alert type="info" variant="tonal">
          <template #title>Loading Stations</template>
          <template #text>Please wait while station data is being loaded.</template>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>
