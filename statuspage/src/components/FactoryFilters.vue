<script setup lang="ts">
  import { watch } from 'vue'
  import { useFactoryStore } from '../stores/factory'

  const factoryStore = useFactoryStore()

  function debounce<T extends (...args: never[]) => unknown>(
    func: T,
    delay: number = 150
  ): T {
    let timeoutId: number
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }) as T
  }

  const debouncedUpdateSelectedFactoryTypes = debounce((factoryTypes: string[]) =>
    factoryStore.updateSelectedFactoryTypes(factoryTypes)
  )

  const debouncedUpdateSelectedSubPowerCircuitIds = debounce(
    (subPowerCircuitIds: number[]) =>
      factoryStore.updateSelectedSubPowerCircuitIds(subPowerCircuitIds)
  )

  const debouncedUpdateSelectedFactoryStatuses = debounce(
    (factoryStatuses: string[]) =>
      factoryStore.updateSelectedFactoryStatuses(factoryStatuses)
  )

  const showIndividualChips = (items: string[]) => items.length <= 2
  const showIndividualChipsNumbers = (items: number[]) => items.length <= 2
  const isAllSelected = (items: string[]) => items.includes('ALL')
  const isAllSelectedNumbers = (items: number[]) => items.includes(-1)

  // Auto-select "ALL" options on initial load
  watch(
    () => [
      factoryStore.factoryTypeOptions,
      factoryStore.subPowerCircuitIdOptions,
      factoryStore.factoryStatusOptions,
    ],
    ([factoryOptions, powerOptions, statusOptions]) => {
      if (
        factoryOptions.length > 0 &&
        factoryStore.filters.selectedFactoryTypes.length === 0
      ) {
        factoryStore.updateSelectedFactoryTypes(['ALL'])
      }
      if (
        powerOptions.length > 0 &&
        factoryStore.filters.selectedSubPowerCircuitIds.length === 0
      ) {
        factoryStore.updateSelectedSubPowerCircuitIds([-1])
      }
      if (
        statusOptions.length > 0 &&
        factoryStore.filters.selectedFactoryStatuses.length === 0
      ) {
        factoryStore.updateSelectedFactoryStatuses(['ALL'])
      }
    },
    { immediate: true }
  )
</script>

<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-filter</v-icon>
      Factory Filters
    </v-card-title>

    <v-card-text>
      <v-row dense class="mb-3 align-center">
        <v-col cols="12" md="4">
          <v-autocomplete
            :model-value="factoryStore.filters.selectedFactoryTypes"
            @update:model-value="debouncedUpdateSelectedFactoryTypes"
            :items="factoryStore.factoryTypeOptions"
            label="Factory Type"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-factory"
            :chips="showIndividualChips(factoryStore.filters.selectedFactoryTypes)"
            :closable-chips="
              showIndividualChips(factoryStore.filters.selectedFactoryTypes)
            "
            hide-details
            :menu-props="{ maxHeight: '300' }"
          >
            <template
              v-if="!showIndividualChips(factoryStore.filters.selectedFactoryTypes)"
              #selection="{ index }"
            >
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="() => factoryStore.updateSelectedFactoryTypes([])"
              >
                <span
                  v-if="isAllSelected(factoryStore.filters.selectedFactoryTypes)"
                >
                  All Types
                </span>
                <span v-else>
                  {{ factoryStore.filters.selectedFactoryTypes.length }}
                  of
                  {{ factoryStore.factoryTypeOptions.length - 1 }} types
                </span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="4">
          <v-autocomplete
            :model-value="factoryStore.filters.selectedSubPowerCircuitIds"
            @update:model-value="debouncedUpdateSelectedSubPowerCircuitIds"
            :items="factoryStore.subPowerCircuitIdOptions"
            label="Power Circuit"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-lightning-bolt"
            :chips="
              showIndividualChipsNumbers(
                factoryStore.filters.selectedSubPowerCircuitIds
              )
            "
            :closable-chips="
              showIndividualChipsNumbers(
                factoryStore.filters.selectedSubPowerCircuitIds
              )
            "
            hide-details
            :menu-props="{ maxHeight: '300' }"
          >
            <template
              v-if="
                !showIndividualChipsNumbers(
                  factoryStore.filters.selectedSubPowerCircuitIds
                )
              "
              #selection="{ index }"
            >
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="
                  () => factoryStore.updateSelectedSubPowerCircuitIds([])
                "
              >
                <span
                  v-if="
                    isAllSelectedNumbers(
                      factoryStore.filters.selectedSubPowerCircuitIds
                    )
                  "
                >
                  All Circuits
                </span>
                <span v-else>
                  {{ factoryStore.filters.selectedSubPowerCircuitIds.length }}
                  of
                  {{ factoryStore.subPowerCircuitIdOptions.length - 1 }}
                  circuits
                </span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="4">
          <v-autocomplete
            :model-value="factoryStore.filters.selectedFactoryStatuses"
            @update:model-value="debouncedUpdateSelectedFactoryStatuses"
            :items="factoryStore.factoryStatusOptions"
            label="Factory Status"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-cog"
            :chips="
              showIndividualChips(factoryStore.filters.selectedFactoryStatuses)
            "
            :closable-chips="
              showIndividualChips(factoryStore.filters.selectedFactoryStatuses)
            "
            hide-details
            :menu-props="{ maxHeight: '300' }"
          >
            <template
              v-if="
                !showIndividualChips(factoryStore.filters.selectedFactoryStatuses)
              "
              #selection="{ index }"
            >
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="() => factoryStore.updateSelectedFactoryStatuses([])"
              >
                <span
                  v-if="isAllSelected(factoryStore.filters.selectedFactoryStatuses)"
                >
                  All Statuses
                </span>
                <span v-else>
                  {{ factoryStore.filters.selectedFactoryStatuses.length }}
                  of
                  {{ factoryStore.factoryStatusOptions.length - 1 }}
                  statuses
                </span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
