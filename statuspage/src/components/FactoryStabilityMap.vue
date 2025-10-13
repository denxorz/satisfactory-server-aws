<script setup lang="ts">
  import { Graphviz } from '@hpcc-js/wasm'
  import { computed, onMounted, ref, watch } from 'vue'
  import type { Factory } from '../gql/graphql'
  import { useFactoryStore } from '../stores/factory'

  const factoryStore = useFactoryStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const graphviz = ref()
  const mergedImageUrl = ref('')
  const selectedFactory = ref<Factory | null>(null)

  const factories = computed(() => factoryStore.factoriesWithTransparency)

  const getFactoryColor = (percentageProducing: number): string => {
    if (percentageProducing === 100) return '#00FF00'
    if (percentageProducing >= 95 && percentageProducing < 100) return '#FFFF00'
    if (percentageProducing >= 1 && percentageProducing < 95) return '#FFA500'
    return '#FF0000'
  }

  const getFactoryShape = (factoryType: string): string => {
    const circleTypes = ['Converter', 'HadronCollider', 'QuantumEncoder']
    return circleTypes.includes(factoryType) ? 'triangle' : 'circle'
  }

  const handleMapClick = (event: globalThis.MouseEvent) => {
    const rect = (event.target as globalThis.HTMLElement).getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    const minX = -320000
    const maxX = 435000
    const minY = -372000
    const maxY = 372000

    const scaleX = (maxX - minX) / rect.width
    const scaleY = (maxY - minY) / rect.height

    const factoryX = clickX * scaleX + minX
    const factoryY = clickY * scaleY + minY

    const clickRadius = 5000
    let closestFactory: Factory | null = null
    let closestDistance = Infinity

    factories.value.forEach(factory => {
      if (
        factory.x !== null &&
        factory.x !== undefined &&
        factory.y !== null &&
        factory.y !== undefined
      ) {
        const distance = Math.sqrt(
          (factoryX - factory.x) ** 2 + (factoryY - factory.y) ** 2
        )

        if (distance < clickRadius && distance < closestDistance) {
          closestDistance = distance
          closestFactory = factory
        }
      }
    })

    selectedFactory.value = closestFactory
  }

  const dotContent = computed(() => {
    const minX = -320000
    const maxX = 380000
    const minY = -250000
    const maxY = 450000

    const mapWidth = 30
    const mapHeight = 30

    const scaleX = (mapWidth - 2) / (maxX - minX)
    const scaleY = (mapHeight - 2) / (maxY - minY)

    let dot = `digraph G {
      layout=neato;
      size="${mapWidth},${mapHeight}";
      bgcolor=transparent;
      node [shape=circle, style=filled, penwidth=1, width=0.2, height=0.2, fontsize=8, fontname="Arial", label=""];
      edge [fontname="Arial", penwidth=2];
      graph [ranksep=0, nodesep=0, splines=curved];
    `

    const cornerSize = 0.001
    dot += `\n_tl [label="", pos="0,${mapHeight}!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_tr [label="", pos="${mapWidth},${mapHeight}!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_bl [label="", pos="0,0!", width=${cornerSize}, height=${cornerSize}];`
    dot += `\n_br [label="", pos="${mapWidth},0!", width=${cornerSize}, height=${cornerSize}];`

    if (factories.value && factories.value.length > 0) {
      factories.value.forEach((factory, index) => {
        if (
          factory.x !== null &&
          factory.x !== undefined &&
          factory.y !== null &&
          factory.y !== undefined
        ) {
          const x = (factory.x - minX) * scaleX
          const y = mapHeight - (factory.y - minY) * scaleY - 5
          const color = getFactoryColor(factory.percentageProducing)
          const shape = getFactoryShape(factory.type)

          // Apply transparency to filtered-out factories
          const alpha = factory.isTransparent ? 0.1 : 1.0
          const transparentColor =
            color +
            Math.round(alpha * 255)
              .toString(16)
              .padStart(2, '0')
          const transparentBorder = factory.isTransparent
            ? '#000000' +
              Math.round(alpha * 255)
                .toString(16)
                .padStart(2, '0')
            : '#000000'

          const factoryId = `factory_${index}`
          dot += `\n${factoryId} [shape="${shape}", fillcolor="${transparentColor}", color="${transparentBorder}", pos="${x.toFixed(2)},${y.toFixed(2)}!"];`
        }
      })
    }

    dot += '\n}'

    return dot
  })

  onMounted(async () => {
    try {
      isLoading.value = true
      graphviz.value = await Graphviz.load()
    } catch {
      error.value = 'Failed to load graph renderer'
    } finally {
      isLoading.value = false
    }
  })

  watch(
    [dotContent, graphviz],
    async ([newDotContent, newGraphviz]) => {
      if (newGraphviz && newDotContent) {
        try {
          const svg = await newGraphviz.dot(newDotContent)
          await mergeImages(svg)
        } catch {
          error.value = 'Failed to render graph'
        }
      }
    },
    { immediate: true }
  )

  const mergeImages = async (svgContent: string) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const bgImg = new window.Image()
      bgImg.crossOrigin = 'anonymous'

      bgImg.onload = () => {
        canvas.width = bgImg.width
        canvas.height = bgImg.height

        ctx.filter = 'grayscale(0.4) contrast(0.8) brightness(1.1)'
        ctx.globalAlpha = 0.4
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = 1.0
        ctx.filter = 'none'

        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        const svgImg = new window.Image()
        svgImg.crossOrigin = 'anonymous'

        svgImg.onload = () => {
          ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(blob => {
            if (blob) {
              mergedImageUrl.value = URL.createObjectURL(blob)
            }
          }, 'image/png')
        }

        svgImg.src = svgUrl
      }

      bgImg.src = '/1920px-Biome_Map.jpg'
    } catch {
      // Handle merge error silently
    }
  }
</script>

<template>
  <v-card>
    <v-card-title>
      <div>
        <div>Factory Stability Map</div>
        <div class="text-caption text-uppercase">
          Selected: {{ selectedFactory?.type ?? '-' }} /
          {{ selectedFactory?.percentageProducing ?? '-' }}% / Main:{{
            selectedFactory?.mainPowerCircuitId ?? '-'
          }}
          / Sub:{{ selectedFactory?.subPowerCircuitId ?? '-' }}
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="isLoading" class="text-center pa-8">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
        <div class="mt-4" style="color: #e59345">
          Loading factory stability map...
        </div>
      </div>

      <div v-else-if="error" class="text-center pa-8">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <div
        v-if="mergedImageUrl && !isLoading && !error"
        style="position: relative; overflow: hidden; min-height: 400px"
        @click="handleMapClick"
      >
        <div class="map-wrapper">
          <v-img
            :src="mergedImageUrl"
            alt="Factory Stability Map with Background"
            class="map-image"
          />
        </div>
      </div>
    </v-card-text>
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

  .factory-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #000;
  }

  .factory-type-filter,
  .power-circuit-filter,
  .factory-status-filter {
    max-height: 120px;
    overflow-y: auto;
  }

  .factory-type-filter .v-field__input,
  .power-circuit-filter .v-field__input,
  .factory-status-filter .v-field__input {
    max-height: 100px;
    overflow-y: auto;
  }

  .factory-type-filter .v-chip,
  .power-circuit-filter .v-chip,
  .factory-status-filter .v-chip {
    margin: 2px;
  }

  .factory-type-filter .v-field,
  .power-circuit-filter .v-field,
  .factory-status-filter .v-field {
    margin-bottom: 0;
  }
</style>

