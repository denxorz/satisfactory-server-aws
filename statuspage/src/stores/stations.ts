import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { Station } from '../gql/graphql'

interface Filters {
  searchText: string
  selectedStationTypes: string[]
  selectedTransferTypes: string[]
  selectedCargoTypes: string[]
}

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Filter state
  const filters = ref<Filters>({
    searchText: '',
    selectedStationTypes: [],
    selectedTransferTypes: [],
    selectedCargoTypes: [],
  })

  const setStations = (newStations: Station[]) => {
    stations.value = newStations
    lastUpdated.value = new Date()
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const clearStations = () => {
    stations.value = []
    error.value = null
    lastUpdated.value = null
  }

  const isDataStale = () => {
    if (!lastUpdated.value) return true
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    return lastUpdated.value < oneDayAgo
  }

  // Update individual filter properties
  const updateSearchText = (searchText: string) => {
    filters.value.searchText = searchText
  }

  const updateSelectedStationTypes = (selectedStationTypes: string[]) => {
    filters.value.selectedStationTypes = selectedStationTypes
  }

  const toggleStationType = (stationType: string) => {
    const currentTypes = filters.value.selectedStationTypes
    const index = currentTypes.indexOf(stationType)
    if (index > -1) {
      // Remove if already selected
      currentTypes.splice(index, 1)
    } else {
      // Add if not selected
      currentTypes.push(stationType)
    }
    filters.value.selectedStationTypes = [...currentTypes]
  }

  const updateSelectedTransferTypes = (selectedTransferTypes: string[]) => {
    filters.value.selectedTransferTypes = selectedTransferTypes
  }

  const toggleTransferType = (transferType: string) => {
    const currentTypes = filters.value.selectedTransferTypes
    const index = currentTypes.indexOf(transferType)
    if (index > -1) {
      // Remove if already selected
      currentTypes.splice(index, 1)
    } else {
      // Add if not selected
      currentTypes.push(transferType)
    }
    filters.value.selectedTransferTypes = [...currentTypes]
  }

  const updateSelectedCargoTypes = (selectedCargoTypes: string[]) => {
    filters.value.selectedCargoTypes = selectedCargoTypes
  }

  // Update all filters at once
  const updateFilters = (newFilters: Filters) => {
    filters.value = newFilters
  }

  // Clear all filters
  const clearFilters = () => {
    filters.value = {
      searchText: '',
      selectedStationTypes: [],
      selectedTransferTypes: [],
      selectedCargoTypes: [],
    }
  }

  // Available filter options
  const stationTypeOptions = computed(() => {
    const types = new Set(stations.value.map(s => s.type).filter(Boolean))
    return Array.from(types).map(type => ({
      title: (type && type.charAt(0).toUpperCase() + type.slice(1)) || 'Unknown',
      value: type || 'unknown',
      prependIcon: icon(type),
    }))
  })

  const transferTypeOptions = [
    { title: 'Load', value: 'load', prependIcon: 'mdi-tray-arrow-down' },
    { title: 'Unload', value: 'unload', prependIcon: 'mdi-tray-arrow-up' },
  ]

  const cargoTypeOptions = computed(() => {
    const cargoTypes = new Set<string>()
    stations.value.forEach(station => {
      station.cargoTypes?.forEach(type => {
        if (type) cargoTypes.add(type)
      })
    })
    return Array.from(cargoTypes)
      .sort()
      .map(type => ({
        title: type,
        value: type,
      }))
  })

  // Filtered stations based on current filters
  const filteredStations = computed(() => {
    return stations.value.filter(station => {
      // Text search
      if (
        filters.value.searchText &&
        !station.name?.toLowerCase().includes(filters.value.searchText.toLowerCase())
      ) {
        return false
      }

      // Station type filter
      if (filters.value.selectedStationTypes.length > 0) {
        const stationType = station.type || 'unknown'
        if (!filters.value.selectedStationTypes.includes(stationType)) {
          return false
        }
      }

      // Transfer type filter
      if (filters.value.selectedTransferTypes.length > 0) {
        const isUnload = station.isUnload
        const transferType = isUnload ? 'unload' : 'load'
        if (!filters.value.selectedTransferTypes.includes(transferType)) {
          return false
        }
      }

      // Cargo type filter
      if (filters.value.selectedCargoTypes.length > 0) {
        const stationCargoTypes = station.cargoTypes || []
        const hasMatchingCargo = filters.value.selectedCargoTypes.some(
          selectedType => stationCargoTypes.includes(selectedType)
        )
        if (!hasMatchingCargo) {
          return false
        }
      }

      return true
    })
  })

  const icon = (type?: string) => {
    if (type === 'train') return 'mdi-train'
    if (type === 'truck') return 'mdi-truck'
    if (type === 'drone') return 'mdi-quadcopter'
    return 'mdi-help-box'
  }

  return {
    stations,
    filteredStations,
    filters,
    stationTypeOptions,
    transferTypeOptions,
    cargoTypeOptions,
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    setStations,
    setLoading,
    setError,
    clearStations,
    updateSearchText,
    updateSelectedStationTypes,
    toggleStationType,
    updateSelectedTransferTypes,
    toggleTransferType,
    updateSelectedCargoTypes,
    updateFilters,
    clearFilters,
    isDataStale,
  }
})
