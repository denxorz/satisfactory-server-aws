import type { Factory } from '../gql/graphql'

export const powerCircuitColors = [
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

export const getPowerCircuitColor = (
  powerCircuitId: number | null | undefined
): string => {
  if (!powerCircuitId) return '#D3D3D3'
  if (powerCircuitId < 0) return '#808080'

  const circuitIndex = powerCircuitId % powerCircuitColors.length
  return powerCircuitColors[circuitIndex]
}

export const getFactoryColorForPowerCircuit = (factory: Factory): string => {
  return getPowerCircuitColor(factory.subPowerCircuitId)
}

export const getFactoryColorForStability = (factory: Factory): string => {
  const percentageProducing = factory.percentageProducing
  if (percentageProducing === 100) return '#00FF00'
  if (percentageProducing >= 95 && percentageProducing < 100) return '#FFFF00'
  if (percentageProducing >= 1 && percentageProducing < 95) return '#FFA500'
  return '#FF0000'
}
