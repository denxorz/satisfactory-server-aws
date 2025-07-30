<script setup lang="ts">
import Toolbar from './components/Toolbar.vue'
import TrainsTable from './components/TrainsTable.vue'
</script>

<template>
  <v-app>
    <Toolbar />
    <v-main>
      <v-container class="pa-8" fluid>
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <TrainsTable />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
