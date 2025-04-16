<script setup lang="ts">
import Status from './components/Ec2Status.vue'
</script>

<template>
  <div>
    <img src="./assets/ctor.png" class="logo constructor" alt="constructor" />
  </div>
  <Status />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo.constructor:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
