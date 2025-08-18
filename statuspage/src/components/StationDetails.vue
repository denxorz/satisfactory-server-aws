<script setup lang="ts">
  import { computed } from 'vue'
  import type { SaveDetails, Station, Transporter } from '../gql/graphql'
  import { useStationsStore } from '../stores/stations'

  const props = defineProps<{
    modelValue: boolean
    station: Station | null | undefined
    saveDetails?: SaveDetails
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

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

  const closeDialog = () => {
    emit('update:modelValue', false)
  }
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="value => emit('update:modelValue', value)"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        Station Details
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog" :rounded="false" size="small">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <div v-if="station">
          <v-row dense>
            <v-col cols="4">
              <strong>Id:</strong>
            </v-col>
            <v-col cols="8">
              {{ station.id || '??' }}
            </v-col>

            <v-col cols="4">
              <strong>Name:</strong>
            </v-col>
            <v-col cols="8">
              {{ station.name || '??' }}
            </v-col>

            <v-col cols="4">
              <strong>Type:</strong>
            </v-col>
            <v-col cols="8">
              {{ station.isUnload ? 'Unload' : 'Load' }}
            </v-col>

            <v-col cols="4">
              <strong>Cargo Type:</strong>
            </v-col>
            <v-col cols="8">
              {{ station.cargoTypes?.join('/') || 'Unknown' }}
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div>
            <strong>Vehicles:</strong>
            <div v-if="selectedStationVehicles.length > 0" style="margin-top: 8px">
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
            <div v-else style="margin-top: 8px; color: #666">
              No vehicles associated with this station
            </div>
          </div>
        </div>
        <div v-else style="color: #999">
          <div>Select a station to see details</div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
