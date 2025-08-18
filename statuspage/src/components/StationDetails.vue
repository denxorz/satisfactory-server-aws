<script setup lang="ts">
  import { computed } from 'vue'
  import type { SaveDetails, Station, Transporter } from '../gql/graphql'
  import { useStationsStore } from '../stores/stations'

  interface Props {
    station: Station | null | undefined
    saveDetails?: SaveDetails
    onClose?: () => void
  }

  const props = defineProps<Props>()
  const stationsStore = useStationsStore()

  const selectedStationVehicles = computed(() => {
    if (!props.station) return []

    return (
      props.station.transporters?.map(t => ({
        id: t?.id ?? '',
        name: t?.name ?? '',
        destinations: getDestinations(t, props.station?.id || ''),
      })) ?? []
    )
  })

  const getDestinations = (transporter: Transporter, currentStationId: string) => {
    const stations = stationsStore.stations

    if (!stations) return []

    const destinationIds: string[] = []
    if (transporter.from) destinationIds.push(transporter.from)
    if (transporter.to) destinationIds.push(transporter.to)

    const destinationStations = stations.filter(
      station =>
        destinationIds.includes(station.id || '') && station.id !== currentStationId
    )

    return destinationStations.map(station => station.name || 'Unnamed Station')
  }
</script>

<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>Station Details</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="props.onClose?.()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <div v-if="station">
        <div>
          <strong>Id:</strong>
          {{ station.id || '??' }}
        </div>
        <div>
          <strong>Name:</strong>
          {{ station.name || '??' }}
        </div>
        <div>
          <strong>Type:</strong>
          {{ station.isUnload ? 'Unload' : 'Load' }}
        </div>
        <div>
          <strong>Cargo Type:</strong>
          {{ station.cargoTypes?.join('/') || 'Unknown' }}
        </div>
        <div style="margin-top: 12px"><strong>Vehicles:</strong></div>
        <div v-if="selectedStationVehicles.length > 0" style="margin-top: 4px">
          <ul style="padding-left: 18px">
            <li
              v-for="vehicle in selectedStationVehicles"
              :key="vehicle?.id || 'unknown-vehicle'"
            >
              {{ vehicle?.name ?? vehicle?.id }} (Destinations:
              {{ vehicle?.destinations.join(', ') }})
            </li>
          </ul>
        </div>
        <div v-else style="margin-top: 4px; color: #666">
          No vehicles associated with this station
        </div>
      </div>
      <div v-else style="color: #999">
        <div>Select a station to see details</div>
      </div>
    </v-card-text>
  </v-card>
</template>
