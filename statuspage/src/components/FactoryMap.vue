<script setup lang="ts">
  import { Graphviz } from '@hpcc-js/wasm'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useStationsStore } from '../stores/stations'

  const stationsStore = useStationsStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const graphviz = ref()
  const mergedImageUrl = ref('')

  const factories = computed(() => stationsStore.filteredFactories)

  function debounce<T extends (...args: never[]) => unknown>(
    func: T,
    delay: number = 150
  ): T {
    let timeoutId: number
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }) as T
  }

  const debouncedUpdateSelectedFactoryTypes = debounce((factoryTypes: string[]) =>
    stationsStore.updateSelectedFactoryTypes(factoryTypes)
  )

  const allFactoryTypesSelected = computed(() => {
    return (
      stationsStore.filters.selectedFactoryTypes.length ===
      stationsStore.factoryTypeOptions.length
    )
  })

  const noFactoryTypesSelected = computed(() => {
    return stationsStore.filters.selectedFactoryTypes.length === 0
  })

  const showIndividualChips = computed(() => {
    return stationsStore.filters.selectedFactoryTypes.length <= 2
  })

  const selectAllFactoryTypes = () => {
    const allTypes = stationsStore.factoryTypeOptions.map(option => option.value)
    stationsStore.updateSelectedFactoryTypes(allTypes)
  }

  const clearAllFactoryTypes = () => {
    stationsStore.updateSelectedFactoryTypes([])
  }

  watch(
    () => stationsStore.factoryTypeOptions,
    newOptions => {
      if (
        newOptions.length > 0 &&
        stationsStore.filters.selectedFactoryTypes.length === 0
      ) {
        const allTypes = newOptions.map(option => option.value)
        stationsStore.updateSelectedFactoryTypes(allTypes)
      }
    },
    { immediate: true }
  )

  const getFactoryColor = (percentageProducing: number): string => {
    if (percentageProducing === 100) return '#00FF00' // Green
    if (percentageProducing === 0) return '#FF0000' // Red
    return '#FFA500' // Orange
  }

  const dotContent = computed(() => {
    if (!factories.value || factories.value.length === 0) {
      return ''
    }

    // Use coordinate bounds that match StationGraph exactly
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

    factories.value.forEach((factory, index) => {
      if (
        factory.x !== null &&
        factory.x !== undefined &&
        factory.y !== null &&
        factory.y !== undefined
      ) {
        const x = (factory.x - minX) * scaleX
        const y = mapHeight - (factory.y - minY) * scaleY - 5 // Shift factories up by 5 units
        const color = getFactoryColor(factory.percentageProducing)

        const factoryId = `factory_${index}`
        dot += `\n${factoryId} [fillcolor="${color}", color="#000000", pos="${x.toFixed(2)},${y.toFixed(2)}!"];`
      }
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
    } catch (err) {
      console.error('Failed to merge images:', err)
    }
  }
</script>

<template>
  <v-card>
    <v-card-title>Factory Map</v-card-title>

    <div class="pa-4">
      <v-row dense class="mb-3 align-center">
        <v-col cols="auto" class="flex-grow-1" style="max-width: 400px">
          <v-autocomplete
            :model-value="stationsStore.filters.selectedFactoryTypes"
            @update:model-value="debouncedUpdateSelectedFactoryTypes"
            :items="stationsStore.factoryTypeOptions"
            label="Factory Type"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-factory"
            :chips="showIndividualChips"
            :closable-chips="showIndividualChips"
            hide-details
            :menu-props="{ maxHeight: '300' }"
            class="factory-type-filter"
          >
            <template v-if="!showIndividualChips" #selection="{ index }">
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="clearAllFactoryTypes"
              >
                {{ stationsStore.filters.selectedFactoryTypes.length }} of
                {{ stationsStore.factoryTypeOptions.length }} types
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="auto" class="pl-2">
          <div class="d-flex flex-nowrap align-center">
            <v-btn
              size="small"
              variant="outlined"
              @click="selectAllFactoryTypes"
              :disabled="allFactoryTypesSelected"
              class="me-3"
            >
              <v-icon start>mdi-check-all</v-icon>
              All
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              @click="clearAllFactoryTypes"
              :disabled="noFactoryTypesSelected"
            >
              <v-icon start>mdi-close</v-icon>
              None
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-card-text>
      <div v-if="isLoading" class="text-center pa-8">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
        <div class="mt-4" style="color: #e59345">Loading factory map...</div>
      </div>

      <div v-else-if="error" class="text-center pa-8">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <div
        v-if="mergedImageUrl && !isLoading && !error"
        style="position: relative; overflow: hidden; min-height: 400px"
      >
        <div class="map-wrapper">
          <v-img
            :src="mergedImageUrl"
            alt="Factory Map with Background"
            class="map-image"
          />
        </div>
      </div>

      <div v-else-if="!factories || factories.length === 0" class="text-center pa-8">
        <v-alert type="info" variant="tonal">No factory data available</v-alert>
      </div>

      <div
        v-else
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        "
      >
        <v-progress-circular indeterminate size="64"></v-progress-circular>
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

  .factory-type-filter {
    max-height: 120px;
    overflow-y: auto;
  }

  .factory-type-filter .v-field__input {
    max-height: 100px;
    overflow-y: auto;
  }

  .factory-type-filter .v-chip {
    margin: 2px;
  }

  .factory-type-filter .v-field {
    margin-bottom: 0;
  }
</style>
