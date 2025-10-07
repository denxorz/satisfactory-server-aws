import { useQuery } from '@vue/apollo-composable'
import { computed, watch } from 'vue'

import { graphql } from '../gql'
import type { Factory, Station, Uploader } from '../gql/graphql'
import { useFactoryStore } from '../stores/factory'
import { useStationsStore } from '../stores/stations'

export function useStationsData() {
  const stationsStore = useStationsStore()
  const factoryStore = useFactoryStore()

  const shouldSkipQuery = computed(
    () => stationsStore.stations.length > 0 && !stationsStore.isDataStale()
  )

  const { result: resultSaveDetails } = useQuery(
    graphql(`
      query saveDetails {
        saveDetails {
          stations {
            cargoTypes
            cargoFlows {
              type
              isUnload
              flowPerMinute
              isExact
            }
            id
            isUnload
            name
            shortName
            type
            transporters {
              id
              name
              from
              to
              otherStops
            }
            x
            y
          }
          uploaders {
            id
            cargoTypes
            x
            y
          }
          factories {
            id
            type
            percentageProducing
            x
            y
            mainPowerCircuitId
            subPowerCircuitId
          }
        }
      }
    `),
    undefined,
    () => ({
      enabled: !shouldSkipQuery.value,
    })
  )

  const stations = computed(() => {
    const stationsData = resultSaveDetails.value?.saveDetails?.stations ?? []
    return stationsData.filter((s): s is Station => !!s)
  })

  const uploaders = computed(() => {
    const uploadersData = resultSaveDetails.value?.saveDetails?.uploaders ?? []
    return uploadersData.filter((u): u is Uploader => !!u)
  })

  const factories = computed(() => {
    const factoriesData = resultSaveDetails.value?.saveDetails?.factories ?? []
    return factoriesData.filter((f): f is Factory => !!f)
  })

  watch(
    stations,
    newStations => {
      stationsStore.setStations(newStations)
    },
    { immediate: true }
  )

  watch(
    uploaders,
    newUploaders => {
      stationsStore.setUploaders(newUploaders)
    },
    { immediate: true }
  )

  watch(
    factories,
    newFactories => {
      factoryStore.setFactories(newFactories)
    },
    { immediate: true }
  )

  return {
    stations,
    uploaders,
    factories,
  }
}

