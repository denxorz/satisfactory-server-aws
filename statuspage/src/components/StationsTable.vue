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

  const selectedStations = ref<string[]>([])
  const selectedStation = computed(() =>
    stations.value.find(s => s.id === selectedStations.value[0])
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
    :items="stations"
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
