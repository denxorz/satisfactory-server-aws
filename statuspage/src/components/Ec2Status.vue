<script setup>
import { computed, ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";

import { graphql } from "../gql";

const { result } = useQuery(
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

const startRes = ref();
const status = computed(() => startRes.value?.data?.start?.status ?? result.value?.status?.status ?? "??");
const previousStatus = computed(() => startRes.value?.data?.start?.previousStatus ?? result.value?.status?.previousStatus ?? "??");
const detailStatus = computed(() => startRes.value?.data?.start?.detail ?? result.value?.status?.detail ?? "??");

const startServer = async () => {
  startRes.value = await start();
}
</script>

<template>
  <h1>{{ status }}</h1>
  Previous status: {{ previousStatus }}
  Detail status: {{ detailStatus }}

  <div class="card">
    <button type="button" @click="startServer">Start server</button>
  </div>
</template>
