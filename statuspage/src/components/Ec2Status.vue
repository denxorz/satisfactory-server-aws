<script setup lang="ts">
import { computed, ref } from "vue";
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

const startRes = ref();
const status = computed(() => result.value?.status?.status ?? "offline");
const previousStatus = computed(() => result.value?.status?.previousStatus ?? "offline");
const detailStatus = computed(() => result.value?.status?.detail ?? "offline");

const startServer = async () => {
  startRes.value = await start();
  await refetch();
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
