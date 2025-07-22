<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useTheme } from 'vuetify';

import { graphql } from "../gql";
import ctorImg from '../assets/ctor.png';

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

const theme = useTheme();
const isDark = computed({
  get: () => theme.global.current.value.dark,
  set: (val: boolean) => {
    theme.global.name.value = val ? 'dark' : 'light';
  }
});

const startServer = async () => {
  startRes.value = await start();
  await refetch();
}

const downloadSave = async () => {
  lastSaveEnabled.value = true
}

const downloadLog = async () => {
  lastLogEnabled.value = true
}
</script>
<template>
  <v-app-bar>
    <template #prepend>
      <v-img :src="ctorImg" alt="constructor" class="mr-4 ml-4" style="height: 40px; width: 40px;" />
    </template>
    <v-app-bar-title>Satisfactory Server Status</v-app-bar-title>
    <span class="mr-4"><strong class="mr-4">Status:</strong> {{ status }}</span>
    <span class="mr-4"><strong class="mr-4">Detail:</strong> {{ detailStatus }}</span>
    <v-btn variant="outlined" @click="startServer" class="mr-4" prepend-icon="mdi-play-box">Start</v-btn>
    <v-btn variant="outlined" @click="downloadSave" class="mr-4" prepend-icon="mdi-file-download">
      Save
    </v-btn>
    <v-btn variant="outlined" @click="downloadLog" class="mr-4" prepend-icon="mdi-file-download">
      Log
    </v-btn>
    <v-btn @click="isDark = !isDark" class="mr-4" title="Switch to dark/light mode" icon="mdi-theme-light-dark" />
  </v-app-bar>
</template>