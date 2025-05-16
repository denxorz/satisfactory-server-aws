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

const startServer = async () => {
  startRes.value = await start();
  await refetch();
}
</script>

<template>
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


</template>
