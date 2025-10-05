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

  const debouncedUpdateSelectedSubPowerCircuitIds = debounce(
    (subPowerCircuitIds: number[]) =>
      stationsStore.updateSelectedSubPowerCircuitIds(subPowerCircuitIds)
  )

  const debouncedUpdateSelectedFactoryStatuses = debounce(
    (factoryStatuses: string[]) =>
      stationsStore.updateSelectedFactoryStatuses(factoryStatuses)
  )

  const showIndividualChips = (items: string[]) => items.length <= 2
  const showIndividualChipsNumbers = (items: number[]) => items.length <= 2
  const isAllSelected = (items: string[]) => items.includes('ALL')
  const isAllSelectedNumbers = (items: number[]) => items.includes(-1)

  // Auto-select "ALL" options on initial load
  watch(
    () => [
      stationsStore.factoryTypeOptions,
      stationsStore.subPowerCircuitIdOptions,
      stationsStore.factoryStatusOptions,
    ],
    ([factoryOptions, powerOptions, statusOptions]) => {
      if (
        factoryOptions.length > 0 &&
        stationsStore.filters.selectedFactoryTypes.length === 0
      ) {
        stationsStore.updateSelectedFactoryTypes(['ALL'])
      }
      if (
        powerOptions.length > 0 &&
        stationsStore.filters.selectedSubPowerCircuitIds.length === 0
      ) {
        stationsStore.updateSelectedSubPowerCircuitIds([-1])
      }
      if (
        statusOptions.length > 0 &&
        stationsStore.filters.selectedFactoryStatuses.length === 0
      ) {
        stationsStore.updateSelectedFactoryStatuses(['ALL'])
      }
    },
    { immediate: true }
  )

  // Color palette for different power circuits - using X11 color names supported by DOT
  const powerCircuitColors = [
    'red', // Bright red
    'green', // Bright green
    'blue', // Bright blue
    'yellow', // Bright yellow
    'magenta', // Bright magenta
    'cyan', // Bright cyan
    'orange', // Bright orange
    'brown', // Brown
    'lime', // Bright lime
    'gold', // Gold
    'turquoise', // Turquoise
    'violet', // Violet
    'maroon', // Dark red
    'forestgreen', // Dark green
    'royalblue', // Royal blue
    'deeppink', // Pink-red
    'greenyellow', // Yellow-green
    'crimson', // Dark red
    'navy', // Dark blue
    'orangered', // Orange-red
    'mediumpurple', // Purple
    'mediumseagreen', // Green-blue
    'coral', // Orange-pink
    'teal', // Blue-green
    'slategray', // Gray-blue
    'olive', // Olive green
    'indigo', // Dark purple-blue
    'silver', // Silver
    'khaki', // Yellow-brown
    'plum', // Purple-pink
  ]

  const getPowerCircuitColor = (
    powerCircuitId: number | null | undefined
  ): string => {
    if (!powerCircuitId) return 'lightgray'
    if (powerCircuitId < 0) return 'gray'

    const circuitIndex = powerCircuitId % powerCircuitColors.length
    return powerCircuitColors[circuitIndex]
  }

  const getFactoryShape = (factoryType: string): string => {
    const circleTypes = ['Converter', 'HadronCollider', 'QuantumEncoder']
    return circleTypes.includes(factoryType) ? 'triangle' : 'circle'
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
          const color = getPowerCircuitColor(factory.subPowerCircuitId)
          const shape = getFactoryShape(factory.type)

          const factoryId = `factory_${index}`
          dot += `\n${factoryId} [shape="${shape}", fillcolor="${color}", color="#000000", pos="${x.toFixed(2)},${y.toFixed(2)}!"];`
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
    <v-card-title>Factory Power Circuit Map</v-card-title>

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
            :chips="showIndividualChips(stationsStore.filters.selectedFactoryTypes)"
            :closable-chips="
              showIndividualChips(stationsStore.filters.selectedFactoryTypes)
            "
            hide-details
            :menu-props="{ maxHeight: '300' }"
          >
            <template
              v-if="!showIndividualChips(stationsStore.filters.selectedFactoryTypes)"
              #selection="{ index }"
            >
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="() => stationsStore.updateSelectedFactoryTypes([])"
              >
                <span
                  v-if="isAllSelected(stationsStore.filters.selectedFactoryTypes)"
                >
                  All Types
                </span>
                <span v-else>
                  {{ stationsStore.filters.selectedFactoryTypes.length }} of
                  {{ stationsStore.factoryTypeOptions.length - 1 }} types
                </span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="auto" class="flex-grow-1" style="max-width: 400px">
          <v-autocomplete
            :model-value="stationsStore.filters.selectedSubPowerCircuitIds"
            @update:model-value="debouncedUpdateSelectedSubPowerCircuitIds"
            :items="stationsStore.subPowerCircuitIdOptions"
            label="Power Circuit"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-lightning-bolt"
            :chips="
              showIndividualChipsNumbers(
                stationsStore.filters.selectedSubPowerCircuitIds
              )
            "
            :closable-chips="
              showIndividualChipsNumbers(
                stationsStore.filters.selectedSubPowerCircuitIds
              )
            "
            hide-details
            :menu-props="{ maxHeight: '300' }"
          >
            <template
              v-if="
                !showIndividualChipsNumbers(
                  stationsStore.filters.selectedSubPowerCircuitIds
                )
              "
              #selection="{ index }"
            >
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="
                  () => stationsStore.updateSelectedSubPowerCircuitIds([])
                "
              >
                <span
                  v-if="
                    isAllSelectedNumbers(
                      stationsStore.filters.selectedSubPowerCircuitIds
                    )
                  "
                >
                  All Circuits
                </span>
                <span v-else>
                  {{ stationsStore.filters.selectedSubPowerCircuitIds.length }} of
                  {{ stationsStore.subPowerCircuitIdOptions.length - 1 }} circuits
                </span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="auto" class="flex-grow-1" style="max-width: 400px">
          <v-autocomplete
            :model-value="stationsStore.filters.selectedFactoryStatuses"
            @update:model-value="debouncedUpdateSelectedFactoryStatuses"
            :items="stationsStore.factoryStatusOptions"
            label="Factory Status"
            multiple
            clearable
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-cog"
            :chips="
              showIndividualChips(stationsStore.filters.selectedFactoryStatuses)
            "
            :closable-chips="
              showIndividualChips(stationsStore.filters.selectedFactoryStatuses)
            "
            hide-details
            :menu-props="{ maxHeight: '300' }"
          >
            <template
              v-if="
                !showIndividualChips(stationsStore.filters.selectedFactoryStatuses)
              "
              #selection="{ index }"
            >
              <v-chip
                v-if="index === 0"
                size="small"
                color="primary"
                variant="tonal"
                closable
                @click:close="() => stationsStore.updateSelectedFactoryStatuses([])"
              >
                <span
                  v-if="isAllSelected(stationsStore.filters.selectedFactoryStatuses)"
                >
                  All Statuses
                </span>
                <span v-else>
                  {{ stationsStore.filters.selectedFactoryStatuses.length }} of
                  {{ stationsStore.factoryStatusOptions.length - 1 }} statuses
                </span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </div>

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
    transition: all 0.3s ease;
  }

  .map-wrapper:hover {
    transform: scale(1.02);
  }

  .map-image {
    object-fit: contain;
    transition: opacity 0.2s;
  }
</style>
