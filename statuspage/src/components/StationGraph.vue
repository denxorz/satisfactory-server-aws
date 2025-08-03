<script setup lang="ts">
  import { Graphviz } from '@hpcc-js/wasm'
  import { computed, onMounted, ref, watch } from 'vue'

  import type { Station } from '../gql/graphql'

  interface Props {
    stations: Station[]
  }

  const props = defineProps<Props>()

  const stations = computed(() => props.stations)

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

    const dotId = (id?: string) => id?.replace(/[^a-zA-Z0-9]/g, '_') ?? '??'

    let dot = `
      digraph G {
        layout=neato;
        size="${mapWidth},${mapHeight}";
        bgcolor="transparent";
        node [shape=box, style=filled, fontname="Arial"];
        edge [fontname="Arial"];
        graph [ranksep=0, nodesep=0, splines=curved];
    `

    const uniqueStations = new Map<string, Station>()
    stations.value.forEach(station => {
      const name = station.name || `Station ${station.id}`
      if (!uniqueStations.has(name)) {
        uniqueStations.set(name, station)
      }
    })

    uniqueStations.forEach((station, name) => {
      const color = '#666666'
      const borderColor = '#333333'

      const x = (station.x - minX) * scaleX
      const y = mapHeight - (station.y - minY) * scaleY

      dot += `\n${dotId(name)} [label="${name}", fillcolor="${color}", fontcolor="white", color="${borderColor}", pos="${x.toFixed(2)},${y.toFixed(2)}!", penwidth=0.5];`
    })

    const cornerSize = 0.001
    dot += `\n_tl [label="", pos="0,${mapHeight}!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_tr [label="", pos="${mapWidth},${mapHeight}!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_bl [label="", pos="0,0!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_br [label="", pos="${mapWidth},0!", width=${cornerSize}, height=${cornerSize}];`

    stations.value.forEach(station => {
      ;(station.transporters ?? [])
        .filter(t => !!t.to && t.to !== '??' && t.to !== station.id)
        .forEach(transporter => {
          const toStation = stations.value.find(s => s.id === transporter.to)

          let edgeColor = '#9E9E9E'
          switch (station.type) {
            case 'train':
              edgeColor = '#4CAF50'
              break
            case 'truck':
              edgeColor = '#FF9800'
              break
            case 'drone':
              edgeColor = '#2196F3'
              break
          }

          if (station.isUnload) {
            dot += `\n${dotId(station.name)} -> ${dotId(toStation?.name)} [dir=back, color="${edgeColor}", penwidth=1.5];`
          } else {
            dot += `\n${dotId(station.name)} -> ${dotId(toStation?.name)} [color="${edgeColor}", penwidth=1.5];`
          }
        })
    })

    dot += '\n}'

    console.log(dot)
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
        <div class="mt-4">Loading graph...</div>
      </div>

      <div v-else-if="error" class="text-center pa-8">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <div v-else>
        <div v-if="!props.stations.length" class="text-center pa-8">
          <v-alert type="info" variant="tonal">
            <template #title>No Station Data Available</template>
            <template #text>This will be automatically updated daily.</template>
          </v-alert>
        </div>

        <div v-else class="mb-4">
          <v-chip-group>
            <v-chip color="success" size="small">
              <v-icon start>mdi-train</v-icon>
              Train Stations
            </v-chip>
            <v-chip color="warning" size="small">
              <v-icon start>mdi-truck</v-icon>
              Truck Stations
            </v-chip>
            <v-chip color="primary" size="small">
              <v-icon start>mdi-quadcopter</v-icon>
              Drone Stations
            </v-chip>
          </v-chip-group>
        </div>
      </div>

      <div
        v-if="mergedImageUrl && !isLoading && !error && props.stations.length"
        style="
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          min-height: 400px;
          border: none;
          box-shadow: none;
          padding: 8px;
        "
      >
        <div
          style="position: relative; cursor: pointer"
          @click="showBottomSheet = true"
        >
          <v-img
            :src="mergedImageUrl"
            alt="Station Network Graph with Background"
            style="object-fit: contain; transition: opacity 0.2s"
          />
          <div
            style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            "
          >
            <v-icon size="small">mdi-fullscreen</v-icon>
          </div>
        </div>
      </div>

      <!-- Loading placeholder -->
      <div
        v-else-if="isLoading"
        class="d-flex align-center justify-center"
        style="min-height: 400px; background: #f5f5f5; border-radius: 4px"
      >
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </div>

      <!-- Error placeholder -->
      <div
        v-else-if="error"
        class="d-flex align-center justify-center"
        style="min-height: 400px; background: #f5f5f5; border-radius: 4px"
      >
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>
    </v-card-text>
  </v-card>

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
        <v-img :src="mergedImageUrl" alt="Station Network Map" />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

