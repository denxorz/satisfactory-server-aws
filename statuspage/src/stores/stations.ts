import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { Factory, Station, Uploader } from '../gql/graphql'

interface Filters {
  searchText: string
  selectedStationTypes: string[]
  selectedTransferTypes: string[]
  selectedCargoTypes: string[]
  selectedFactoryTypes: string[]
  showUploaders: boolean
}

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>([])
  const uploaders = ref<Uploader[]>([])
  const factories = ref<Factory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Filter state
  const filters = ref<Filters>({
    searchText: '',
    selectedStationTypes: [],
    selectedTransferTypes: [],
    selectedCargoTypes: [],
    selectedFactoryTypes: [],
    showUploaders: true,
  })

  const setStations = (newStations: Station[]) => {
    stations.value = newStations
    lastUpdated.value = new Date()
  }

  const setUploaders = (newUploaders: Uploader[]) => {
    uploaders.value = newUploaders
  }

  const setFactories = (newFactories: Factory[]) => {
    factories.value = newFactories
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

  const updateSelectedFactoryTypes = (selectedFactoryTypes: string[]) => {
    filters.value.selectedFactoryTypes = selectedFactoryTypes
  }

  const toggleShowUploaders = () => {
    filters.value.showUploaders = !filters.value.showUploaders
  }

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
      selectedFactoryTypes: [],
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

  const factoryTypeOptions = computed(() => {
    const factoryTypeCounts = new Map<string, number>()

    // Count factories by type
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

  // Filtered uploaders based on current filters
  const filteredUploaders = computed(() => {
    if (!filters.value.showUploaders) {
      return []
    }

    return uploaders.value.filter(uploader => {
      // Cargo type filter (unified for both stations and uploaders)
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

  // Filtered factories based on current filters
  const filteredFactories = computed(() => {
    return factories.value.filter(factory => {
      // Factory type filter
      if (filters.value.selectedFactoryTypes.length > 0) {
        const factoryType = factory.type || 'unknown'
        if (!filters.value.selectedFactoryTypes.includes(factoryType)) {
          return false
        }
      }

      return true
    })
  })

  return {
    stations,
    uploaders,
    factories,
    filteredStations,
    filteredUploaders,
    filteredFactories,
    filters,
    cargoTypeOptions,
    factoryTypeOptions,
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    setStations,
    setUploaders,
    setFactories,
    setLoading,
    setError,
    clearStations,
    updateSearchText,
    updateSelectedStationTypes,
    toggleStationType,
    updateSelectedTransferTypes,
    toggleTransferType,
    updateSelectedCargoTypes,
    updateSelectedFactoryTypes,
    toggleShowUploaders,
    updateFilters,
    clearFilters,
    isDataStale,
  }
})

