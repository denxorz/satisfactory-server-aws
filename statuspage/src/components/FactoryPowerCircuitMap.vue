<script setup lang="ts">
  import { getFactoryColorForPowerCircuit } from '../utils/factoryColors'
  import BaseFactoryMap from './BaseFactoryMap.vue'
</script>

<template>
  <BaseFactoryMap
    title="Factory Power Circuit Map"
    loading-text="Loading factory power circuit map..."
    :get-factory-color="getFactoryColorForPowerCircuit"
  />
</template>

