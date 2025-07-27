<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";

import { graphql } from "../gql";
import type { Station, Transporter } from "../gql/graphql";
import { useTheme } from 'vuetify';

const { result: resultSaveDetails } = useQuery(
  graphql(`
    query saveDetails {
      saveDetails {
        trainStations {
          cargoTypes
          id
          isUnload
          name
          transporters {
            id
          }
        }
      }
    }
  `));

const sortedTrainStations = computed(() => {
  const stations = resultSaveDetails.value?.saveDetails?.trainStations as (Station | null)[] | undefined;
  if (!stations) return [];
  return [...stations]
    .filter((s): s is Station => !!s)
    .sort((a: Station, b: Station) => {
      const nameA = (a?.name || 'Unnamed Station').toLowerCase();
      const nameB = (b?.name || 'Unnamed Station').toLowerCase();
      return nameA.localeCompare(nameB);
    });
});

const selectedStations = ref<string[]>([]);
const selectedStation = computed(() => sortedTrainStations.value.find(s => s.id === selectedStations.value[0]));
const selectedStationTrains = computed(() => selectedStation.value?.transporters?.map(t => ({ id: t?.id ?? '', destinations: getTrainDestinations(t?.id ?? '', selectedStation.value?.id || '') })) ?? []);

const theme = useTheme();

function rowProps({ internalItem }: { internalItem: { value: string } }) {
  const isDark = theme.global.current.value.dark;
  if (internalItem.value && selectedStations.value.includes(internalItem.value)) {
    return {
      style: isDark
        ? 'background-color: #374151 !important; color: #fff;'
        : 'background-color: #e3f2fd !important;'
    };
  }
  return {};
}

const getTrainDestinations = (transporterId: string, currentStationId: string) => {
  const stations = resultSaveDetails.value?.saveDetails?.trainStations as (Station | null)[] | undefined;
  if (!stations) return [];
  const destinations = stations
    .filter((station): station is Station => !!station)
    .filter((station: Station) =>
      station?.transporters?.some((transporter): transporter is Transporter => !!transporter && transporter.id === transporterId) &&
      station?.id !== currentStationId
    );
  return destinations.map((station: Station) => station?.name || 'Unnamed Station');
};
</script>
<template>
  <h2>Train Stations</h2>
  <div style="display: flex; gap: 32px; align-items: flex-start;">
    <v-data-table :headers="[
      { title: '', key: 'type', width: '48px' },
      { title: '', key: 'transfer', width: '48px' },
      { title: 'Station', key: 'name', width: '40%' },
      { title: 'Cargo', key: 'cargoType' },
      { title: 'Trains', key: 'trains' }
    ]" :items="sortedTrainStations" item-key="id" class="elevation-1" hide-footer :items-per-page="-1"
      v-model="selectedStations" select-strategy="single"
      @click:row="(_: unknown, { internalItem, toggleSelect }: { internalItem: Station, toggleSelect: (item: Station) => void }) => toggleSelect(internalItem)"
      :row-props="rowProps">
      <template #item.type="">
        <v-icon>
          mdi-train
        </v-icon>
      </template>
      <template #item.transfer="{ item }">
        <v-icon>
          {{ item?.isUnload ? 'mdi-tray-arrow-up' : 'mdi-tray-arrow-down' }}
        </v-icon>
      </template>
      <template #item.cargoType="{ item }">
        {{ item?.cargoTypes?.join('/') || 'Unknown' }}
      </template>
      <template #item.trains="{ item }">
        {{ item?.transporters?.length || 0 }}
      </template>
    </v-data-table>
    <div v-if="selectedStation" style="min-width: 320px; max-width: 400px;">
      <h3>Station Details</h3>
      <div><strong>Id:</strong> {{ selectedStation.id || '??' }}</div>
      <div><strong>Name:</strong> {{ selectedStation.name || '??' }}</div>
      <div><strong>Type:</strong> {{ selectedStation.isUnload ? 'Unload' : 'Load' }}</div>
      <div><strong>Cargo Type:</strong> {{ selectedStation.cargoTypes?.join('/') || 'Unknown' }}</div>
      <div style="margin-top: 12px;"><strong>Trains:</strong></div>
      <div v-if="selectedStationTrains.length > 0" style="margin-top: 4px;">
        <ul style="padding-left: 18px;">
          <li v-for="train in selectedStationTrains" :key="train?.id || 'unknown-train'">
            {{ train?.id }} -> {{ train?.destinations.join(', ') }}
          </li>
        </ul>
      </div>
      <div v-else style="margin-top: 4px; color: #666;">
        No trains associated with this station
      </div>
    </div>
    <div v-else style="min-width: 320px; max-width: 400px; color: #999;">
      <h3>Station Details</h3>
      <div>Select a station to see details</div>
    </div>
  </div>
  <div v-if="!resultSaveDetails?.saveDetails?.trainStations">
    <p>Loading train stations...</p>
  </div>
</template>
<style></style>