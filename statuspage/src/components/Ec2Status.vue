<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";

import { graphql } from "../gql";

const { result, refetch } = useQuery(
  graphql(`
    query status {
      status {
        status
        previousStatus
        detail
      }
    }
  `),
  null, {
  pollInterval: 10000,
}
);

const { mutate: start } = useMutation(
  graphql(`
    mutation start {
      start {
        status
        previousStatus
        detail
      }
    }
  `)
);

const lastSaveEnabled = ref(false);
const { result: resultLastSave } = useQuery(
  graphql(`
    query lastSave {
      lastSave {
        url
      }
    }
  `),
  null,
  { enabled: lastSaveEnabled }
);

watch(resultLastSave, nv => {
  if (nv?.lastSave) {
    window.open(nv.lastSave?.url ?? '');
    lastSaveEnabled.value = false;
  }
})

const lastLogEnabled = ref(false);
const { result: resultLastLog } = useQuery(
  graphql(`
    query lastLog {
      lastLog {
        url
      }
    }
  `),
  null,
  { enabled: lastLogEnabled }
);

watch(resultLastLog, nv => {
  if (nv?.lastLog) {
    window.open(nv.lastLog?.url ?? '');
    lastLogEnabled.value = false;
  }
})

const startRes = ref();
const status = computed(() => result.value?.status?.status ?? "stopped");
const detailStatus = computed(() => result.value?.status?.detail ?? "stopped");

const expandedRows = ref(new Set<string>());

const toggleRow = (stationId: string) => {
  if (expandedRows.value.has(stationId)) {
    expandedRows.value.delete(stationId);
  } else {
    expandedRows.value.add(stationId);
  }
};

const sortedTrainStations = computed(() => {
  const stations = resultSaveDetails.value?.saveDetails?.trainStations;
  if (!stations) return [];
  
  return [...stations].sort((a, b) => {
    const nameA = (a?.name || 'Unnamed Station').toLowerCase();
    const nameB = (b?.name || 'Unnamed Station').toLowerCase();
    return nameA.localeCompare(nameB);
  });
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

const startServer = async () => {
  startRes.value = await start();
  await refetch();
}

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
</script>

<template>
  <div style="display: flex; gap: 40px;">
    <div style="flex: 1;">
      <h1>{{ status }}</h1>

      <span style="margin-bottom: 20px;  display: block;">
        Detail status: {{ detailStatus }}
      </span>

      <button type="button" style="margin-bottom: 40px;  display: block;" @click="startServer">
        Start server
      </button>

      <button type="button" style="margin-bottom: 20px;  display: block;" @click="lastSaveEnabled = true">
        Download last save
      </button>

      <button type="button" style="margin-bottom: 20px;  display: block;" @click="lastLogEnabled = true">
        Download last log
      </button>
    </div>

    <div style="flex: 1;">
      <h2>Train Stations</h2>
      <div v-if="resultSaveDetails?.saveDetails?.trainStations">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #4a5568; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 40%;">Station Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Cargo Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Trains</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="station in sortedTrainStations" :key="station?.id || 'unknown'">
              <tr 
                @click="toggleRow(station?.id || 'unknown')"
                style="border-bottom: 1px solid #ddd; cursor: pointer;"
              >
                <td style="border: 1px solid #ddd; padding: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left;">
                  {{ expandedRows.has(station?.id || 'unknown') ? '▼' : '▶' }} {{ station?.name || 'Unnamed Station' }}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">{{ station?.cargoType || 'Unknown' }}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{ station?.isUnload ? 'Unload' : 'Load' }}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{ station?.trains?.length || 0 }}</td>
              </tr>
              <tr v-if="expandedRows.has(station?.id || 'unknown')">
                <td colspan="4" style="border: 1px solid #ddd; padding: 8px;">
                  <strong>Train Routes:</strong>
                  <div v-if="station?.trains && station.trains.length > 0" style="margin-top: 4px;">
                    <div v-for="train in station.trains" :key="train?.id || 'unknown-train'" style="margin-bottom: 8px;">
                      <span style="font-family: monospace; font-weight: bold;">{{ train?.id }}</span>
                      <span style="margin-left: 8px; color: #666;">→</span>
                      <span v-if="getTrainDestinations(train?.id || '', station?.id || '').length > 0" style="margin-left: 8px;">
                        {{ getTrainDestinations(train?.id || '', station?.id || '').join(', ') }}
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
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>Loading train stations...</p>
      </div>
    </div>
  </div>
</template>
