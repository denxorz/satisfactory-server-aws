<script setup lang="ts">
  import { computed } from 'vue'

  import type { Station } from '../gql/graphql'

  interface Props {
    stations: Station[]
  }

  const props = defineProps<Props>()

  console.log('CargoFlowChart - Stations received:', props.stations)

  const cargoFlowChartData = computed(() => {
    const flowData: {
      [key: string]: { delta: number; consumed: number; produced: number }
    } = {}

    props.stations.forEach(station => {
      station.cargoFlows?.forEach(flow => {
        if (flow && flow.type && flow.flowPerMinute) {
          const type = flow.type

          if (!flowData[type]) {
            flowData[type] = { delta: 0, consumed: 0, produced: 0 }
          }

          if (flow.isUnload) {
            flowData[type].consumed += flow.flowPerMinute
            flowData[type].delta -= flow.flowPerMinute
          } else {
            flowData[type].produced += flow.flowPerMinute
            flowData[type].delta += flow.flowPerMinute
          }
        }
      })
    })

    const entries = Object.entries(flowData).sort(([a], [b]) => a.localeCompare(b))
    const categories = entries.map(([type, _]) => type)
    const consumedSeries = entries.map(([_, values]) => values.consumed)
    const deltaSeries = entries.map(([_, values]) => values.delta)

    const result = {
      categories,
      series: [
        {
          name: 'Consumed',
          data: consumedSeries,
        },
        {
          name: 'Available',
          data: deltaSeries,
        },
      ],
    }

    // Debug: Log the computed chart data
    console.log('CargoFlowChart - Computed data:', result)

    return result
  })

  // ApexCharts options for stacked column chart
  const chartOptions = computed(() => ({
    chart: {
      type: 'bar',
      height: 400,
      width: '100%',
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: ['#FF6384', '#4BC0C0'],
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '70%',
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (value: number) {
          return value.toFixed(0)
        },
      },
    },
    xaxis: {
      categories: cargoFlowChartData.value.categories,
    },
    yaxis: {
      title: {
        text: 'Flow per Minute',
      },
    },
  }))
</script>

<template>
  <v-card>
    <div v-if="cargoFlowChartData.categories.length > 0">
      <apexchart
        :options="chartOptions"
        :series="cargoFlowChartData.series"
        type="bar"
        height="400"
      />
    </div>
    <v-card-text v-else>No cargo flow data available</v-card-text>
  </v-card>
</template>
