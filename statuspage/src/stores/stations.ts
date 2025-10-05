import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { Station, Uploader } from '../gql/graphql'

interface Filters {
  searchText: string
  selectedStationTypes: string[]
  selectedTransferTypes: string[]
  selectedCargoTypes: string[]
  showUploaders: boolean
}

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>([])
  const uploaders = ref<Uploader[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const filters = ref<Filters>({
    searchText: '',
    selectedStationTypes: [],
    selectedTransferTypes: [],
    selectedCargoTypes: [],
    showUploaders: true,
  })

  const setStations = (newStations: Station[]) => {
    stations.value = newStations
    lastUpdated.value = new Date()
  }

  const setUploaders = (newUploaders: Uploader[]) => {
    uploaders.value = newUploaders
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
      // Remove if already selected (make it active again)
      currentTypes.splice(index, 1)
    } else {
      // Add if not selected (make it inactive)
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
      // Remove if already selected (make it active again)
      currentTypes.splice(index, 1)
    } else {
      // Add if not selected (make it inactive)
      currentTypes.push(transferType)
    }
    filters.value.selectedTransferTypes = [...currentTypes]
  }

  const updateSelectedCargoTypes = (selectedCargoTypes: string[]) => {
    filters.value.selectedCargoTypes = selectedCargoTypes
  }

  const toggleShowUploaders = () => {
    filters.value.showUploaders = !filters.value.showUploaders
  }

  const updateFilters = (newFilters: Filters) => {
    filters.value = newFilters
  }

  const clearFilters = () => {
    filters.value = {
      searchText: '',
      selectedStationTypes: [],
      selectedTransferTypes: [],
      selectedCargoTypes: [],
      showUploaders: true,
    }
  }

  const cargoTypeOptions = computed(() => {
    const cargoTypes = new Set<string>()

    // Add cargo types from stations
    stations.value.forEach(station => {
      station.cargoTypes?.forEach(type => {
        if (type) cargoTypes.add(type)
      })
    })

    // Add cargo types from uploaders
    uploaders.value.forEach(uploader => {
      uploader.cargoTypes?.forEach(type => {
        if (type) cargoTypes.add(type)
      })
    })

    return Array.from(cargoTypes)
      .sort((a, b) => a.localeCompare(b))
      .map(type => ({
        title: type,
        value: type,
      }))
  })

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

      if (filters.value.selectedStationTypes.length > 0) {
        const stationType = station.type || 'unknown'
        if (!filters.value.selectedStationTypes.includes(stationType)) {
          return false
        }
      }

      if (filters.value.selectedTransferTypes.length > 0) {
        const isUnload = station.isUnload
        const transferType = isUnload ? 'unload' : 'load'
        if (!filters.value.selectedTransferTypes.includes(transferType)) {
          return false
        }
      }

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

  const filteredUploaders = computed(() => {
    if (!filters.value.showUploaders) {
      return []
    }

    return uploaders.value.filter(uploader => {
      if (filters.value.selectedCargoTypes.length > 0) {
        const uploaderCargoTypes = uploader.cargoTypes || []
        const hasMatchingCargo = filters.value.selectedCargoTypes.some(
          selectedType => uploaderCargoTypes.includes(selectedType)
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
    uploaders,
    filteredStations,
    filteredUploaders,
    filters,
    cargoTypeOptions,
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    setStations,
    setUploaders,
    setLoading,
    setError,
    clearStations,
    updateSearchText,
    updateSelectedStationTypes,
    toggleStationType,
    updateSelectedTransferTypes,
    toggleTransferType,
    updateSelectedCargoTypes,
    toggleShowUploaders,
    updateFilters,
    clearFilters,
    isDataStale,
  }
})

