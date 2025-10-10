<script setup lang="ts">
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

  const debouncedUpdateSelectedPowerCircuits = debounce((powerCircuits: string[]) =>
    factoryStore.updateSelectedPowerCircuits(powerCircuits)
  )

  const debouncedUpdateSelectedFactoryStabilities = debounce(
    (factoryStabilities: string[]) =>
      factoryStore.updateSelectedFactoryStabilities(factoryStabilities)
  )
</script>

<template>
  <v-card>
    <v-card-title>Factory Filters</v-card-title>
    <div class="pa-6 pt-0">
      <v-row dense class="mb-4">
        <!-- Factory Type Filter -->
        <v-col cols="12" sm="4">
          <v-autocomplete
            :model-value="factoryStore.filters.selectedFactoryTypes"
            @update:model-value="debouncedUpdateSelectedFactoryTypes"
            :items="factoryStore.factoryTypeOptions"
            label="Type"
            multiple
            clearable
            density="compact"
            variant="filled"
            prepend-inner-icon="mdi-factory"
            hide-details
            single-line
          >
            <template v-slot:selection="{ item, index }">
              <div v-if="index == 0">
                Type ({{ factoryStore.filters.selectedFactoryTypes.length }})
              </div>
            </template>
          </v-autocomplete>
        </v-col>

        <!-- Power Circuit Filter -->
        <v-col cols="12" sm="4">
          <v-autocomplete
            :model-value="factoryStore.filters.selectedPowerCircuits"
            @update:model-value="debouncedUpdateSelectedPowerCircuits"
            :items="factoryStore.powerCircuitIdOptions"
            label="Power Circuit"
            multiple
            clearable
            density="compact"
            variant="filled"
            prepend-inner-icon="mdi-lightning-bolt"
            hide-details
            single-line
          >
            <template v-slot:selection="{ item, index }">
              <div v-if="index == 0">
                Power Circuit ({{
                  factoryStore.filters.selectedPowerCircuits.length
                }})
              </div>
            </template>
          </v-autocomplete>
        </v-col>

        <!-- Factory Status Filter -->
        <v-col cols="12" sm="4">
          <v-autocomplete
            :model-value="factoryStore.filters.selectedFactoryStabilities"
            @update:model-value="debouncedUpdateSelectedFactoryStabilities"
            :items="factoryStore.factoryStatusOptions"
            label="Stability"
            multiple
            clearable
            density="compact"
            variant="filled"
            prepend-inner-icon="mdi-cog"
            hide-details
            single-line
          >
            <template v-slot:selection="{ item, index }">
              <div v-if="index == 0">
                Stability ({{
                  factoryStore.filters.selectedFactoryStabilities.length
                }})
              </div>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

