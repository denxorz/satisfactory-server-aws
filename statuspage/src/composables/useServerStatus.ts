import { useQuery, useSubscription } from '@vue/apollo-composable'
import { computed } from 'vue'

import { graphql } from '../gql'

export function useServerStatus() {
  const { result: statusResult } = useQuery(
    graphql(`
      query status {
        status(id: "last") {
          id
          status
          previousStatus
          detail
        }
      }
    `)
  )

  useSubscription(
    graphql(`
      subscription statusChanged {
        statusChanged {
          id
          status
          previousStatus
          detail
        }
      }
    `)
  )

  const status = computed(() => statusResult.value?.status?.status ?? 'stopped')
  const shouldPollGameServer = computed(() => status.value !== 'stopped')

  const { result: gameServerProbeResult } = useQuery(
    graphql(`
      query gameServerProbe($host: String, $port: Int) {
        gameServerProbe(host: $host, port: $port) {
          success
          error
          serverState
          serverVersion
          serverName
        }
      }
    `),
    () => ({
      host: import.meta.env.VITE_SatisfactoryDNS,
      port: 7777,
    }),
    {
      enabled: shouldPollGameServer,
      pollInterval: 15000,
    }
  )

  const serverStatus = computed(() => status.value)
  const serverProbeData = computed(
    () => gameServerProbeResult.value?.gameServerProbe
  )

  return {
    serverStatus,
    serverProbeData,
  }
}
