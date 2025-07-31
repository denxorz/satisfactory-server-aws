<script setup lang="ts">
  import { computed } from 'vue'
  import type { Station, Transporter } from '../gql/graphql'

  interface Props {
    station: Station | null | undefined
    saveDetails?:
      | {
          stations?: (Station | null)[] | null
        }
      | null
      | undefined
    onClose?: () => void
  }

  const props = defineProps<Props>()

  const selectedStationVehicles = computed(() => {
    if (!props.station) return []

    return (
      props.station.transporters?.map(t => ({
        id: t?.id ?? '',
        destinations: getDestinations(t?.id ?? '', props.station?.id || ''),
      })) ?? []
    )
  })

  const getDestinations = (transporterId: string, currentStationId: string) => {
    const stations = props.saveDetails?.stations
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
              {{ vehicle?.id }} -> {{ vehicle?.destinations.join(', ') }}
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
