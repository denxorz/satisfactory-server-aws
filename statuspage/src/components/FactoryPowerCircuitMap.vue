<script setup lang="ts">
  import { Graphviz } from '@hpcc-js/wasm'
  import { onMounted, ref, watch } from 'vue'
  import type { Factory } from '../gql/graphql'
  import { useFactoryStore } from '../stores/factory'
  import { getMainCircuitName, getSubCircuitName } from '../utils/circuitNames'

  const factoryStore = useFactoryStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const graphviz = ref()
  const mergedImageUrl = ref('')
  const selectedFactory = ref<Factory | null>(null)

  const powerCircuitColors = [
    '#FF0000',
    '#008000',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#FFA500',
    '#A52A2A',
    '#00FF00',
    '#FFD700',
    '#40E0D0',
    '#EE82EE',
    '#800000',
    '#228B22',
    '#4169E1',
    '#FF1493',
    '#ADFF2F',
    '#DC143C',
    '#000080',
    '#FF4500',
    '#9370DB',
    '#3CB371',
    '#FF7F50',
    '#008080',
    '#708090',
    '#808000',
    '#4B0082',
    '#C0C0C0',
    '#F0E68C',
    '#DDA0DD',
  ]

  const getPowerCircuitColor = (
    powerCircuitId: number | null | undefined
  ): string => {
    if (!powerCircuitId) return '#D3D3D3'
    if (powerCircuitId < 0) return '#808080'

    const circuitIndex = powerCircuitId % powerCircuitColors.length
    return powerCircuitColors[circuitIndex]
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

    factoryStore.nonFilteredFactories.forEach(factory => {
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

  const createDotContent = (factories: Factory[]) => {
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

    if (factories && factories.length > 0) {
      factories.forEach((factory, index) => {
        if (
          factory.x !== null &&
          factory.x !== undefined &&
          factory.y !== null &&
          factory.y !== undefined
        ) {
          const x = (factory.x - minX) * scaleX
          const y = mapHeight - (factory.y - minY) * scaleY - 5
          const color = getPowerCircuitColor(factory.subPowerCircuitId)
          const shape = getFactoryShape(factory.type)

          const factoryId = `factory_${index}`

          dot += `\n${factoryId} [shape="${shape}", fillcolor="${color}", color="#000000", pos="${x.toFixed(2)},${y.toFixed(2)}!"];`
        }
      })
    }

    dot += '\n}'

    return dot
  }

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
    [
      () => factoryStore.filteredFactories,
      () => factoryStore.nonFilteredFactories,
      graphviz,
    ],
    async ([newFilteredFactories, newNonFilteredFactories, newGraphviz]) => {
      if (
        newGraphviz &&
        (newFilteredFactories.length > 0 || newNonFilteredFactories.length > 0)
      ) {
        try {
          const dotContentFiltered = createDotContent(newFilteredFactories)
          const dotContentNonFiltered = createDotContent(newNonFilteredFactories)

          const svgFiltered = await newGraphviz.dot(dotContentFiltered)
          const svgNonFiltered = await newGraphviz.dot(dotContentNonFiltered)
          await mergeImages(svgFiltered, svgNonFiltered)
        } catch {
          error.value = 'Failed to render graph'
        }
      }
    },
    { immediate: true }
  )

  const loadAndMergeSvgs = (
    svgFiltered: string,
    svgNonFiltered: string,
    ctx: any,
    canvas: any
  ) => {
    const loadSvgImage = (svgContent: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        const svgImg = new window.Image()
        svgImg.crossOrigin = 'anonymous'

        svgImg.onload = () => {
          URL.revokeObjectURL(svgUrl)
          resolve(svgImg)
        }
        svgImg.onerror = reject
        svgImg.src = svgUrl
      })
    }

    Promise.all([loadSvgImage(svgFiltered), loadSvgImage(svgNonFiltered)])
      .then(([filteredImg, nonFilteredImg]) => {
        ctx.globalAlpha = 0.3
        ctx.drawImage(filteredImg, 0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = 1.0
        ctx.drawImage(nonFilteredImg, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            mergedImageUrl.value = URL.createObjectURL(blob)
          }
        }, 'image/png')
      })
      .catch(() => {
        error.value = 'Failed to load SVG images'
      })
  }

  const mergeImages = async (svgFiltered: string, svgNonFiltered: string) => {
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
        loadAndMergeSvgs(svgFiltered, svgNonFiltered, ctx, canvas)
      }

      bgImg.src = '/1920px-Biome_Map.jpg'
    } catch {
      // Silent error handling
    }
  }
</script>

<template>
  <v-card>
    <v-card-title>
      <div>
        <div>Factory Power Circuit Map</div>
        <div class="text-caption text-uppercase">
          Selected: {{ selectedFactory?.type ?? '-' }} |
          {{ selectedFactory?.percentageProducing ?? '-' }}% | Main:{{
            getMainCircuitName(selectedFactory?.mainPowerCircuitId)
          }}
          | Sub:{{ getSubCircuitName(selectedFactory?.subPowerCircuitId) }}
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="isLoading" class="text-center pa-8">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
        <div class="mt-4" style="color: #e59345">
          Loading factory power circuit map...
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
            alt="Factory Power Circuit Map with Background"
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
  }

  .map-image {
    object-fit: contain;
    transition: opacity 0.2s;
  }
</style>

