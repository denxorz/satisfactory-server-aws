<script setup lang="ts">
  import { Graphviz } from '@hpcc-js/wasm'
  import { computed, onMounted, ref, watch } from 'vue'

  import type { Station } from '../gql/graphql'
  import { useStationsStore } from '../stores/stations'

  const stationsStore = useStationsStore()

  const stations = computed(() => stationsStore.stations)
  const filteredStations = computed(() => stationsStore.filteredStations)

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const graphviz = ref()

  const showBottomSheet = ref(false)

  const dotContent = computed(() => {
    const minX = -320000
    const maxX = 350000
    const minY = -375000
    const maxY = 300000

    const mapWidth = 20
    const mapHeight = 20

    const scaleX = (mapWidth - 2) / (maxX - minX)
    const scaleY = (mapHeight - 2) / (maxY - minY)

    const dotId = (name?: string) => {
      if (!name) return 'unknown'
      // Sanitize the name for DOT syntax - replace invalid characters with underscores
      // and ensure it starts with a letter or underscore
      const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_')
      return sanitized.startsWith('_') ? `station_${sanitized}` : sanitized
    }

    let dot = `
      digraph G {
        layout=neato;
        size="${mapWidth},${mapHeight}";
        bgcolor="transparent";
        node [shape=box, style=filled, fontname="Arial", fontcolor="#e59345", color="#e59345", penwidth=0.5, fillcolor="#212121", fontweight=600];
        edge [fontname="Arial", penwidth=2];
        graph [ranksep=0, nodesep=0, splines=curved];
    `

    const cornerSize = 0.001
    dot += `\n_tl [label="", pos="0,${mapHeight}!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_tr [label="", pos="${mapWidth},${mapHeight}!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_bl [label="", pos="0,0!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_br [label="", pos="${mapWidth},0!", width=${cornerSize}, height=${cornerSize}];`

    let requiredStations: string[] = []

    const edges = filteredStations.value.flatMap(station => {
      return (station.transporters ?? [])
        .flatMap(transporter => {
          const fromStation = stations.value.find(s => s.id === transporter.from)
          const toStation = stations.value.find(s => s.id === transporter.to)

          if (!fromStation || !toStation) return []

          let edgeColor = '#FF0000'
          let edgeStyle = 'solid'
          let edgePenwidth = 2

          const stationType = station.type
          if (stationType === 'drone') {
            edgeStyle = 'dashed'
          } else if (stationType === 'truck') {
            edgeStyle = 'dotted'
            edgePenwidth = 4
          }

          let cargoTypes = fromStation.cargoTypes ?? []
          if (cargoTypes.length === 0) {
            cargoTypes = fromStation.cargoFlows?.map(c => c.type) ?? []
          }

          if (cargoTypes.length > 0) {
            const cargoType = cargoTypes[0].toLowerCase()

            switch (cargoType) {
              case 'coal':
                edgeColor = '#000000'
                break
              case 'plastic':
                edgeColor = '#4169E1'
                break
              case 'rubber':
                edgeColor = '#154734'
                break
              case 'modularframefused':
                edgeColor = '#FFFF00'
                break
              case 'computer':
                edgeColor = '#00CED1'
                break
              case 'oreuranium':
                edgeColor = '#00FF00'
                break
              case 'modularframeheavy':
                edgeColor = '#F5F5F5'
                break
              case 'aluminumcasing':
                edgeColor = 'darkgray'
                break
              case 'aluminumplate':
                edgeColor = 'gray'
                break
              case 'ficsiteingot':
                edgeColor = 'gold'
                break
              case 'spaceelevatorpart_7':
                edgeColor = 'orange'
                break
              case 'gastank':
                edgeColor = '#FF6B6B'
                break
              case 'fuel':
                edgeColor = '#FFD700'
                break
              case 'quartzcrystal':
                edgeColor = '#FF1493'
                break
              case 'singularitycell':
                edgeColor = '#E6E6FA'
                break
              case 'computersuper':
                edgeColor = '#00BFFF'
                break
              case 'spaceelevatorpart_9':
                edgeColor = '#FF4500'
                break
              case 'turbofuel':
                edgeColor = '#FF8C00'
                break
              case 'sam':
                edgeColor = '#9932CC'
                break
              default:
                console.log(cargoType)
                break
            }
          }

          requiredStations.push(fromStation.shortName || fromStation.id)
          requiredStations.push(toStation.shortName || toStation.id)

          const edges = []

          // Add edge from fromStation to toStation
          edges.push(
            fromStation.isUnload
              ? {
                  from: toStation.shortName || toStation.id,
                  to: fromStation.shortName || fromStation.id,
                  color: edgeColor,
                  style: edgeStyle,
                  penwidth: edgePenwidth,
                }
              : {
                  from: fromStation.shortName || fromStation.id,
                  to: toStation.shortName || toStation.id,
                  color: edgeColor,
                  style: edgeStyle,
                  penwidth: edgePenwidth,
                }
          )

          // Add edges from otherStops to toStation
          if (transporter.otherStops) {
            transporter.otherStops.forEach(stopId => {
              const otherStopStation = stations.value.find(s => s.id === stopId)
              if (otherStopStation) {
                requiredStations.push(
                  otherStopStation.shortName || otherStopStation.id
                )
                edges.push(
                  fromStation.isUnload
                    ? {
                        from: toStation.shortName || toStation.id,
                        to: otherStopStation.shortName || otherStopStation.id,
                        color: edgeColor,
                        style: edgeStyle,
                        penwidth: edgePenwidth,
                      }
                    : {
                        from: otherStopStation.shortName || otherStopStation.id,
                        to: toStation.shortName || toStation.id,
                        color: edgeColor,
                        style: edgeStyle,
                        penwidth: edgePenwidth,
                      }
                )
              }
            })
          }

          return edges
        })
        .filter(t => !!t)
    })

    edges
      .filter(
        (edge, index, self) =>
          index === self.findIndex(e => e.from === edge.from && e.to === edge.to)
      )
      .forEach(edge => {
        dot += `\n${dotId(edge.from)} -> ${dotId(edge.to)} [color="${edge.color}", style="${edge.style}", penwidth=${edge.penwidth}];`
      })

    const uniqueStations = new Map<string, Station>()
    stations.value.forEach(station => {
      const name = station.shortName || `Station ${station.id}`
      if (!uniqueStations.has(name) && requiredStations.includes(name)) {
        uniqueStations.set(name, station)
      }
    })

    uniqueStations.forEach((station, name) => {
      const x = (station.x - minX) * scaleX
      const y = mapHeight - (station.y - minY) * scaleY

      dot += `\n${dotId(name)} [label="${name.toUpperCase()}", pos="${x.toFixed(2)},${y.toFixed(2)}!"];`
    })

    dot += '\n}'

    return dot
  })

  onMounted(async () => {
    try {
      isLoading.value = true
      graphviz.value = await Graphviz.load()
    } catch (err) {
      console.error('Failed to load Graphviz:', err)
      error.value = 'Failed to load graph renderer'
    } finally {
      isLoading.value = false
    }
  })

  const mergedImageUrl = ref('')

  watch(
    [dotContent, graphviz],
    async ([newDotContent, newGraphviz]) => {
      if (newGraphviz && newDotContent) {
        try {
          const svg = await newGraphviz.dot(newDotContent)
          await mergeImages(svg)
        } catch (err) {
          console.error('Failed to render graph:', err)
          error.value = 'Failed to render graph'
        }
      }
    },
    { immediate: true }
  )

  const mergeImages = async (svgContent: string) => {
    try {
      // Create a canvas to merge the images
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Load the background image
      const bgImg = new window.Image()
      bgImg.crossOrigin = 'anonymous'

      bgImg.onload = () => {
        // Set canvas size to match background image
        canvas.width = bgImg.width
        canvas.height = bgImg.height

        // Apply filters to background image
        ctx.filter = 'grayscale(0.4) contrast(0.8) brightness(1.1)'

        // Draw background image with opacity
        ctx.globalAlpha = 0.4
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

        // Reset alpha and filters for SVG
        ctx.globalAlpha = 1.0
        ctx.filter = 'none'

        // Convert SVG to image and overlay it
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        const svgImg = new window.Image()
        svgImg.crossOrigin = 'anonymous'

        svgImg.onload = () => {
          // Calculate SVG position and size (with left margin)
          //const marginLeft = canvas.width * 0.05 // 5% margin
          const svgWidth = canvas.width //* 0.95 // 95% width
          const svgHeight = canvas.height //(svgImg.height / svgImg.width) * svgWidth

          // Center the SVG vertically
          //const svgY = (canvas.height - svgHeight) / 2

          // Draw SVG overlay
          ctx.drawImage(svgImg, 0, 0, svgWidth, svgHeight)

          // Convert canvas to blob and create URL
          canvas.toBlob(blob => {
            if (blob) {
              mergedImageUrl.value = URL.createObjectURL(blob)
            }
          }, 'image/png')
        }

        svgImg.src = svgUrl
      }

      bgImg.src = '/1920px-Biome_Map.jpg'
    } catch (err) {
      console.error('Failed to merge images:', err)
    }
  }
</script>

<template>
  <v-card>
    <v-card-title>Map</v-card-title>

    <v-card-text>
      <div v-if="isLoading" class="text-center pa-8">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
        <div class="mt-4" style="color: #e59345">Loading graph...</div>
      </div>

      <div v-else-if="error" class="text-center pa-8">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <div v-else>
        <div v-if="!filteredStations.length" class="text-center pa-8">
          <v-alert type="info" variant="tonal">
            <template #title>No Station Data Available</template>
            <template #text>This will be automatically updated daily.</template>
          </v-alert>
        </div>
      </div>

      <div
        v-if="mergedImageUrl && !isLoading && !error && filteredStations.length"
        style="position: relative; overflow: hidden; min-height: 400px"
      >
        <div class="map-wrapper" @click="showBottomSheet = true">
          <v-img
            :src="mergedImageUrl"
            alt="Station Network Graph with Background"
            class="map-image"
          />
          <div class="map-overlay">
            <v-icon size="small">mdi-fullscreen</v-icon>
          </div>
        </div>
      </div>

      <!-- Loading placeholder -->
      <div
        v-else-if="isLoading"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        "
      >
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </div>

      <!-- Error placeholder -->
      <div
        v-else-if="error"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        "
      >
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>
    </v-card-text>

    <v-bottom-sheet v-model="showBottomSheet" :retain-focus="false">
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Map (Large)</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showBottomSheet = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-img
            v-if="mergedImageUrl"
            :src="mergedImageUrl"
            alt="Station Network Map"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<style scoped>
  .map-wrapper {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .map-wrapper:hover {
    transform: scale(1.02);
  }

  .map-image {
    object-fit: contain;
    transition: opacity 0.2s;
  }

  .map-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    border: 1px solid rgba(229, 147, 69, 0.5);
    backdrop-filter: blur(5px);
  }
</style>

