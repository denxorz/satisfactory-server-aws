import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { Factory } from '../gql/graphql'
import {
  getMainCircuitFilterName,
  getSubCircuitFilterName,
} from '../utils/circuitNames'

interface FactoryFilters {
  selectedFactoryTypes: string[]
  selectedPowerCircuits: string[]
  selectedFactoryStabilities: string[]
}

export const useFactoryStore = defineStore('factory', () => {
  const factories = ref<Factory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const filters = ref<FactoryFilters>({
    selectedFactoryTypes: [],
    selectedPowerCircuits: [],
    selectedFactoryStabilities: [],
  })

  const setFactories = (newFactories: Factory[]) => {
    factories.value = newFactories
    lastUpdated.value = new Date()
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const clearFactories = () => {
    factories.value = []
    error.value = null
    lastUpdated.value = null
  }

  const isDataStale = () => {
    if (!lastUpdated.value) return true
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    return lastUpdated.value < oneDayAgo
  }

  const updateSelectedFactoryTypes = (selectedFactoryTypes: string[]) => {
    filters.value.selectedFactoryTypes = selectedFactoryTypes
  }

  const updateSelectedPowerCircuits = (selectedPowerCircuits: string[]) => {
    filters.value.selectedPowerCircuits = selectedPowerCircuits
  }

  const updateSelectedFactoryStabilities = (
    selectedFactoryStabilities: string[]
  ) => {
    filters.value.selectedFactoryStabilities = selectedFactoryStabilities
  }

  const updateFilters = (newFilters: FactoryFilters) => {
    filters.value = newFilters
  }

  const clearFilters = () => {
    filters.value = {
      selectedFactoryTypes: [],
      selectedPowerCircuits: [],
      selectedFactoryStabilities: [],
    }
  }

  const factoryTypeOptions = computed(() => {
    const factoryTypeCounts = new Map<string, number>()

    factories.value.forEach(factory => {
      if (factory.type) {
        const currentCount = factoryTypeCounts.get(factory.type) || 0
        factoryTypeCounts.set(factory.type, currentCount + 1)
      }
    })

    return Array.from(factoryTypeCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([type, count]) => ({
        title: `${type} (${count})`,
        value: type,
      }))
  })

  const powerCircuitIdOptions = computed(() => {
    const mainCircuitCounts = new Map<number, number>()
    const subCircuitCounts = new Map<number, number>()

    factories.value.forEach(factory => {
      if (
        factory.mainPowerCircuitId !== null &&
        factory.mainPowerCircuitId !== undefined
      ) {
        const currentCount = mainCircuitCounts.get(factory.mainPowerCircuitId) || 0
        mainCircuitCounts.set(factory.mainPowerCircuitId, currentCount + 1)
      }
      if (
        factory.subPowerCircuitId !== null &&
        factory.subPowerCircuitId !== undefined
      ) {
        const currentCount = subCircuitCounts.get(factory.subPowerCircuitId) || 0
        subCircuitCounts.set(factory.subPowerCircuitId, currentCount + 1)
      }
    })

    const mainOptions = Array.from(mainCircuitCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([circuitId, count]) => ({
        title: getMainCircuitFilterName(circuitId, count),
        value: `main_${circuitId}`,
      }))

    const subOptions = Array.from(subCircuitCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([circuitId, count]) => ({
        title: getSubCircuitFilterName(circuitId, count),
        value: `sub_${circuitId}`,
      }))

    return [...mainOptions, ...subOptions]
  })

  const factoryStatusOptions = computed(() => {
    const statusCounts = new Map<string, number>()

    factories.value.forEach(factory => {
      let status: string
      const percentage = factory.percentageProducing

      if (percentage === 100) {
        status = 'Stable'
      } else if (percentage >= 95 && percentage < 100) {
        status = 'Almost Stable'
      } else if (percentage >= 1 && percentage < 95) {
        status = 'Unstable'
      } else if (percentage === 0) {
        status = 'Off'
      } else {
        status = 'Off' // Treat any other values as Off
      }

      const currentCount = statusCounts.get(status) || 0
      statusCounts.set(status, currentCount + 1)
    })

    return [
      { title: `Stable (${statusCounts.get('Stable') || 0})`, value: 'Stable' },
      {
        title: `Almost Stable (${statusCounts.get('Almost Stable') || 0})`,
        value: 'Almost Stable',
      },
      {
        title: `Unstable (${statusCounts.get('Unstable') || 0})`,
        value: 'Unstable',
      },
      { title: `Off (${statusCounts.get('Off') || 0})`, value: 'Off' },
    ]
  })

  const isFactoryFiltered = (factory: Factory): boolean => {
    // Factory type filter
    if (filters.value.selectedFactoryTypes.length > 0) {
      const factoryType = factory.type || 'unknown'
      if (!filters.value.selectedFactoryTypes.includes(factoryType)) {
        return true
      }
    }

    // Power circuit filter
    if (filters.value.selectedPowerCircuits.length > 0) {
      const mainCircuitKey =
        factory.mainPowerCircuitId !== null &&
        factory.mainPowerCircuitId !== undefined
          ? `main_${factory.mainPowerCircuitId}`
          : null
      const subCircuitKey =
        factory.subPowerCircuitId !== null && factory.subPowerCircuitId !== undefined
          ? `sub_${factory.subPowerCircuitId}`
          : null

      const hasMatchingCircuit =
        (mainCircuitKey &&
          filters.value.selectedPowerCircuits.includes(mainCircuitKey)) ||
        (subCircuitKey &&
          filters.value.selectedPowerCircuits.includes(subCircuitKey))

      if (!hasMatchingCircuit) {
        return true
      }
    }

    // Factory stability filter
    if (filters.value.selectedFactoryStabilities.length > 0) {
      let status: string
      const percentage = factory.percentageProducing

      if (percentage === 100) {
        status = 'Stable'
      } else if (percentage >= 95 && percentage < 100) {
        status = 'Almost Stable'
      } else if (percentage >= 1 && percentage < 95) {
        status = 'Unstable'
      } else if (percentage === 0) {
        status = 'Off'
      } else {
        status = 'Off' // Treat any other values as Off
      }

      if (!filters.value.selectedFactoryStabilities.includes(status)) {
        return true
      }
    }

    return false
  }

  const filteredFactories = computed(() => {
    return (factories.value || []).filter(factory => isFactoryFiltered(factory))
  })

  const nonFilteredFactories = computed(() => {
    return (factories.value || []).filter(factory => !isFactoryFiltered(factory))
  })

  return {
    factories,
    filteredFactories,
    nonFilteredFactories,
    filters,
    factoryTypeOptions,
    powerCircuitIdOptions,
    factoryStatusOptions,
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    setFactories,
    setLoading,
    setError,
    clearFactories,
    updateSelectedFactoryTypes,
    updateSelectedPowerCircuits,
    updateSelectedFactoryStabilities,
    updateFilters,
    clearFilters,
    isDataStale,
  }
})

