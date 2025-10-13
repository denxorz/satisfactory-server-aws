<script setup lang="ts">
  import { getFactoryColorForStability } from '../utils/factoryColors'
  import BaseFactoryMap from './BaseFactoryMap.vue'
</script>

<template>
  <BaseFactoryMap
    title="Factory Stability Map"
    loading-text="Loading factory stability map..."
    :get-factory-color="getFactoryColorForStability"
  />
</template>

