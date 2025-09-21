import { useQuery } from '@vue/apollo-composable'
import { computed, watch } from 'vue'

import { graphql } from '../gql'
import type { Station, Uploader } from '../gql/graphql'
import { useStationsStore } from '../stores/stations'

export function useStationsData() {
  const stationsStore = useStationsStore()

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

  return {
    stations,
    uploaders,
  }
}

