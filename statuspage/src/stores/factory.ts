import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { Factory } from '../gql/graphql'

interface FactoryFilters {
  selectedFactoryTypes: string[]
  selectedSubPowerCircuitIds: number[]
  selectedFactoryStatuses: string[]
}

export const useFactoryStore = defineStore('factory', () => {
  const factories = ref<Factory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const filters = ref<FactoryFilters>({
    selectedFactoryTypes: [],
    selectedSubPowerCircuitIds: [],
    selectedFactoryStatuses: [],
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

  const updateSelectedSubPowerCircuitIds = (
    selectedSubPowerCircuitIds: number[]
  ) => {
    filters.value.selectedSubPowerCircuitIds = selectedSubPowerCircuitIds
  }

  const updateSelectedFactoryStatuses = (selectedFactoryStatuses: string[]) => {
    filters.value.selectedFactoryStatuses = selectedFactoryStatuses
  }

  const updateFilters = (newFilters: FactoryFilters) => {
    filters.value = newFilters
  }

  const clearFilters = () => {
    filters.value = {
      selectedFactoryTypes: [],
      selectedSubPowerCircuitIds: [],
      selectedFactoryStatuses: [],
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

    const typeOptions = Array.from(factoryTypeCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([type, count]) => ({
        title: `${type} (${count})`,
        value: type,
      }))

    const totalFactories = Array.from(factoryTypeCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    )
    return [
      {
        title: `All Types (${totalFactories})`,
        value: 'ALL',
      },
      ...typeOptions,
    ]
  })

  const subPowerCircuitIdOptions = computed(() => {
    const subPowerCircuitIdCounts = new Map<number, number>()

    factories.value.forEach(factory => {
      if (factory.subPowerCircuitId) {
        const currentCount =
          subPowerCircuitIdCounts.get(factory.subPowerCircuitId) || 0
        subPowerCircuitIdCounts.set(factory.subPowerCircuitId, currentCount + 1)
      }
    })

    const circuitOptions = Array.from(subPowerCircuitIdCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([circuitId, count]) => ({
        title: `Circuit ${circuitId} (${count})`,
        value: circuitId,
      }))

    const totalFactories = Array.from(subPowerCircuitIdCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    )
    return [
      {
        title: `All Circuits (${totalFactories})`,
        value: -1,
      },
      ...circuitOptions,
    ]
  })

  const factoryStatusOptions = computed(() => {
    const statusCounts = new Map<string, number>()

    factories.value.forEach(factory => {
      let status: string
      if (factory.percentageProducing === 100) {
        status = 'Stable'
      } else if (factory.percentageProducing === 0) {
        status = 'Off'
      } else {
        status = 'Unstable'
      }

      const currentCount = statusCounts.get(status) || 0
      statusCounts.set(status, currentCount + 1)
    })

    const statusOptions = [
      { title: `Stable (${statusCounts.get('Stable') || 0})`, value: 'Stable' },
      {
        title: `Unstable (${statusCounts.get('Unstable') || 0})`,
        value: 'Unstable',
      },
      { title: `Off (${statusCounts.get('Off') || 0})`, value: 'Off' },
    ]

    const totalFactories = Array.from(statusCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    )
    return [
      {
        title: `All Statuses (${totalFactories})`,
        value: 'ALL',
      },
      ...statusOptions,
    ]
  })

  const filteredFactories = computed(() => {
    return factories.value.filter(factory => {
      if (
        filters.value.selectedFactoryTypes.length === 0 &&
        filters.value.selectedSubPowerCircuitIds.length === 0 &&
        filters.value.selectedFactoryStatuses.length === 0
      ) {
        return false
      }

      if (filters.value.selectedFactoryTypes.length > 0) {
        if (!filters.value.selectedFactoryTypes.includes('ALL')) {
          const factoryType = factory.type || 'unknown'
          if (!filters.value.selectedFactoryTypes.includes(factoryType)) {
            return false
          }
        }
      }

      if (filters.value.selectedSubPowerCircuitIds.length > 0) {
        if (filters.value.selectedSubPowerCircuitIds.includes(-1)) {
          if (!factory.subPowerCircuitId) {
            return false
          }
        } else {
          const subPowerCircuitId = factory.subPowerCircuitId
          if (
            !subPowerCircuitId ||
            !filters.value.selectedSubPowerCircuitIds.includes(subPowerCircuitId)
          ) {
            return false
          }
        }
      }

      if (filters.value.selectedFactoryStatuses.length > 0) {
        if (!filters.value.selectedFactoryStatuses.includes('ALL')) {
          let status: string
          if (factory.percentageProducing === 100) {
            status = 'Stable'
          } else if (factory.percentageProducing === 0) {
            status = 'Off'
          } else {
            status = 'Unstable'
          }

          if (!filters.value.selectedFactoryStatuses.includes(status)) {
            return false
          }
        }
      }

      return true
    })
  })

  return {
    factories,
    filteredFactories,
    filters,
    factoryTypeOptions,
    subPowerCircuitIdOptions,
    factoryStatusOptions,
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    setFactories,
    setLoading,
    setError,
    clearFactories,
    updateSelectedFactoryTypes,
    updateSelectedSubPowerCircuitIds,
    updateSelectedFactoryStatuses,
    updateFilters,
    clearFilters,
    isDataStale,
  }
})
