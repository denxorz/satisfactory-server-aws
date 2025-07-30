<!-- <script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const startRes = ref()
const status = ref()

const startServer = async () => {
  await axios.get(`https://vf8vdbuzg3.execute-api.eu-central-1.amazonaws.com/prod/`)
    .then((res) => {
      startRes.value = res.data;
      console.log({ s: startRes.value });
    })
    .catch((e) => {
      startRes.value = e;
      console.error(e);
    });
}

const getStatus = async () => {
  await axios.get(`https://sgwpfbejmawmnc3udslgkafn3u0wvrxs.lambda-url.eu-central-1.on.aws/status`)
    .then((res) => {
      status.value = res.data;
      console.log({ s: status.value });
    })
    .catch((e) => {
      status.value = e;
      console.error(e);
    });
}

getStatus();
</script>

<template>
  <h1>{{ status }}</h1>

  <div class="card">
    <button type="button" @click="startServer">Start server</button>
  </div>
</template> -->
