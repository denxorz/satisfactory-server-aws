<script setup lang="ts">
  import { getFactoryColorForStability } from '../utils/factoryColors'
  import BaseFactoryMap from './BaseFactoryMap.vue'
</script>

<template>
  <BaseFactoryMap
    title="Factory Stability Map"
    :get-factory-color="getFactoryColorForStability"
  />
</template>

