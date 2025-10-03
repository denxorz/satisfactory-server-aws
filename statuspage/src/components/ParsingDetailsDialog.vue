<script setup lang="ts">
  import { useMutation, useQuery } from '@vue/apollo-composable'
  import { computed, ref, watch } from 'vue'

  import { graphql } from '../gql'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const isRebuilding = ref(false)

  const { mutate: rebuildSaveDetails } = useMutation(
    graphql(`
      mutation RebuildSaveDetails {
        rebuildSaveDetails {
          status
        }
      }
    `)
  )

  const {
    result: saveDetailsBuildInfoResult,
    refetch: refetchSaveDetailsBuildInfo,
  } = useQuery(
    graphql(`
      query SaveDetailsBuildInfo {
        saveDetailsBuildInfo {
          fileName
          fileDate
          parsedDate
        }
      }
    `)
  )

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleString()
  }

  const handleRebuild = async () => {
    try {
      isRebuilding.value = true

      const result = await rebuildSaveDetails()

      if (result?.data?.rebuildSaveDetails?.status === 'ok') {
        setTimeout(async () => {
          await refetchSaveDetailsBuildInfo()
          isRebuilding.value = false
        }, 8000)
      }
    } catch {
      // Handle rebuild error silently
    }
  }

  const closeDialog = () => {
    emit('update:modelValue', false)
  }

  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        refetchSaveDetailsBuildInfo()
      }
    }
  )

  const parseInfo = computed(() => {
    return (
      saveDetailsBuildInfoResult.value?.saveDetailsBuildInfo ?? {
        fileName: '-',
        fileDate: 'unknown',
        parsedDate: 'unknown',
      }
    )
  })
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="value => emit('update:modelValue', value)"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        Save File Parsing Details
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog" :rounded="false" size="small">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="4">
            <strong>File Name:</strong>
          </v-col>
          <v-col cols="8">
            {{ parseInfo.fileName || 'None' }}
          </v-col>

          <v-col cols="4">
            <strong>File Date:</strong>
          </v-col>
          <v-col cols="8">
            {{ formatDate(parseInfo.fileDate) }}
          </v-col>

          <v-col cols="4">
            <strong>Parsed Date:</strong>
          </v-col>
          <v-col cols="8">
            {{ formatDate(parseInfo.parsedDate) }}
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          variant="flat"
          @click="handleRebuild"
          :loading="isRebuilding"
          :disabled="isRebuilding"
          prepend-icon="mdi-refresh"
        >
          Rebuild Save Details
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
