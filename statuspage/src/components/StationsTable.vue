<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import type { Station } from '../gql/graphql'
  import { useStationsStore } from '../stores/stations'
  import StationDetails from './StationDetails.vue'

  const stationsStore = useStationsStore()

  const stations = computed(() => stationsStore.filteredStations)

  const selectedStations = ref<string[]>([])
  const selectedStation = computed(() =>
    stations.value.find(s => s.id === selectedStations.value[0])
  )
  const showStationDetails = ref(false)

  // Show bottom sheet when a station is selected
  watch(selectedStation, newStation => {
    showStationDetails.value = !!newStation
  })

  // Clear selection when dialog is closed
  watch(showStationDetails, newValue => {
    if (!newValue) {
      selectedStations.value = []
    }
  })

  const icon = (type?: string) => {
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
          { title: 'Station', key: 'shortName', width: '40%' },
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
        :items="stations"
        item-key="id"
        class="elevation-1 mt-4"
        hide-footer
        :items-per-page="10"
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
        :sort-by="[{ key: 'shortName', order: 'asc' }]"
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
              ?.map(
                c =>
                  `${c?.isExact ? '' : '~'}${item?.isUnload ? '-' : '+'}${c?.flowPerMinute ?? '??'} ${c?.type}`
              )
              ?.join(' / ') || 'Unknown'
          }}
        </template>
        <template v-slot:item.transporters="{ item }">
          {{ item?.transporters?.length || 0 }}
        </template>
      </v-data-table>

      <StationDetails v-model="showStationDetails" :station="selectedStation" />

      <div v-if="!stations.length" class="text-center pa-8">
        <v-alert type="info" variant="tonal">
          <template #title>Loading Stations</template>
          <template #text>Please wait while station data is being loaded.</template>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>
