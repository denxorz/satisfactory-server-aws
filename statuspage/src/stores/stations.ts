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
      if (filters.value.searchText) {
        const searchText = filters.value.searchText.toLowerCase()
        const stationName = station.name?.toLowerCase() || ''
        const stationShortName = station.shortName?.toLowerCase() || ''

        if (
          !stationName.includes(searchText) &&
          !stationShortName.includes(searchText)
        ) {
          return false
        }
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

  return {
    stations,
    filteredStations,
    filters,
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
