<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";

import { graphql } from "../gql";

const expandedRows = ref(new Set<string>());

const toggleRow = (stationId: string) => {
  if (expandedRows.value.has(stationId)) {
    expandedRows.value.delete(stationId);
  } else {
    expandedRows.value.add(stationId);
  }
};

const { result: resultSaveDetails } = useQuery(
  graphql(`
    query saveDetails {
      saveDetails {
        trainStations {
          cargoType
          id
          isUnload
          name
          trains {
            id
          }
        }
      }
    }
  `));

const sortedTrainStations = computed(() => {
//   const stations = resultSaveDetails.value?.saveDetails?.trainStations;
//   if (!stations) return [];
//   return [...stations].sort((a, b) => {
//     const nameA = (a?.name || 'Unnamed Station').toLowerCase();
//     const nameB = (b?.name || 'Unnamed Station').toLowerCase();
//     return nameA.localeCompare(nameB);
//   });
});

const getTrainDestinations = (trainId: string, currentStationId: string) => {
  const stations = resultSaveDetails.value?.saveDetails?.trainStations;
  if (!stations) return [];
  const destinations = stations.filter(station =>
    station?.trains?.some(train => train?.id === trainId) &&
    station?.id !== currentStationId
  );
  return destinations.map(station => station?.name || 'Unnamed Station');
};

</script>
<template>
    <h2>Train Stations</h2>
    <v-data-table
      :headers="[
        { title: 'Station Name', key: 'name', width: '40%' },
        { title: 'Cargo Type', key: 'cargoType' },
        { title: 'Type', key: 'isUnload' },
        { title: 'Trains', key: 'trains' }
      ]"
      :items="sortedTrainStations"
      item-key="id"
      show-expand
      class="elevation-1"
    >
      <template #item.cargoType="{ item }">
        {{ item?.cargoType || 'Unknown' }}
      </template>
      <template #item.isUnload="{ item }">
        {{ item?.isUnload ? 'Unload' : 'Load' }}
      </template>
      <template #item.trains="{ item }">
        {{ item?.trains?.length || 0 }}
      </template>
      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <strong>Train Routes:</strong>
            <div v-if="item?.trains && item.trains.length > 0" style="margin-top: 4px;">
              <div v-for="train in item.trains" :key="train?.id || 'unknown-train'" style="margin-bottom: 8px;">
                <span style="font-family: monospace; font-weight: bold;">{{ train?.id }}</span>
                <span style="margin-left: 8px; color: #666;">→</span>
                <span v-if="getTrainDestinations(train?.id || '', item?.id || '').length > 0" style="margin-left: 8px;">
                  {{ getTrainDestinations(train?.id || '', item?.id || '').join(', ') }}
                </span>
                <span v-else style="margin-left: 8px; color: #999;">No other destinations</span>
              </div>
            </div>
            <div v-else style="margin-top: 4px; color: #666;">
              No trains associated with this station
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <div v-if="!resultSaveDetails?.saveDetails?.trainStations">
      <p>Loading train stations...</p>
    </div>
</template> 