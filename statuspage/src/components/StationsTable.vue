<script setup lang="ts">
  import { useQuery } from '@vue/apollo-composable'
  import { computed, ref } from 'vue'
  import { useTheme } from 'vuetify'

  import { graphql } from '../gql'
  import type { Maybe, Station, Transporter } from '../gql/graphql'

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
  const selectedStationVehicles = computed(
    () =>
      selectedStation.value?.transporters?.map(t => ({
        id: t?.id ?? '',
        destinations: getDestinations(t?.id ?? '', selectedStation.value?.id || ''),
      })) ?? []
  )

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

  const getDestinations = (transporterId: string, currentStationId: string) => {
    const stations = resultSaveDetails.value?.saveDetails?.stations as
      | (Station | null)[]
      | undefined
    if (!stations) return []
    const destinations = stations
      .filter((station): station is Station => !!station)
      .filter(
        (station: Station) =>
          station?.transporters?.some(
            (transporter): transporter is Transporter =>
              !!transporter && transporter.id === transporterId
          ) && station?.id !== currentStationId
      )
    return destinations.map((station: Station) => station?.name || 'Unnamed Station')
  }

  const icon = (type?: Maybe<string>) => {
    if (type === 'train') return 'mdi-train'
    if (type === 'truck') return 'mdi-truck'
    if (type === 'drone') return 'mdi-quadcopter'
    return 'mdi-help-box'
  }

  // Clear all filters
  const clearFilters = () => {
    searchText.value = ''
    selectedStationTypes.value = undefined
    selectedTransferTypes.value = undefined
    selectedCargoTypes.value = []
  }
</script>

<template>
  <h2>Stations</h2>

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
          (a.cargoFlows?.map(c => c?.type)?.join('/') || 'Unknown').localeCompare(
            b.cargoFlows?.map(c => c?.type)?.join('/') || 'Unknown'
          ),
      },
      { title: 'Vehicles', key: 'transporters' },
    ]"
    :items="preFilteredStations"
    item-key="id"
    class="elevation-1 mt-4"
    hide-footer
    :items-per-page="-1"
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
  <div v-if="selectedStation" style="min-width: 320px; max-width: 400px">
    <h3>Station Details</h3>
    <div>
      <strong>Id:</strong>
      {{ selectedStation.id || '??' }}
    </div>
    <div>
      <strong>Name:</strong>
      {{ selectedStation.name || '??' }}
    </div>
    <div>
      <strong>Type:</strong>
      {{ selectedStation.isUnload ? 'Unload' : 'Load' }}
    </div>
    <div>
      <strong>Cargo Type:</strong>
      {{ selectedStation.cargoTypes?.join('/') || 'Unknown' }}
    </div>
    <div style="margin-top: 12px"><strong>Vehicles:</strong></div>
    <div v-if="selectedStationVehicles.length > 0" style="margin-top: 4px">
      <ul style="padding-left: 18px">
        <li
          v-for="vehicle in selectedStationVehicles"
          :key="vehicle?.id || 'unknown-vehicle'"
        >
          {{ vehicle?.id }} -> {{ vehicle?.destinations.join(', ') }}
        </li>
      </ul>
    </div>
    <div v-else style="margin-top: 4px; color: #666">
      No vehicles associated with this station
    </div>
  </div>
  <div v-else style="min-width: 320px; max-width: 400px; color: #999">
    <h3>Station Details</h3>
    <div>Select a station to see details</div>
  </div>
  <div v-if="!resultSaveDetails?.saveDetails?.stations">
    <p>Loading stations...</p>
  </div>
</template>
