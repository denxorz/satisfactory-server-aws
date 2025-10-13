export const getMainCircuitName = (circuitId: number | null | undefined): string => {
  if (circuitId === null || circuitId === undefined) return '-'
  if (circuitId === -1) return 'None/Fracking'
  return circuitId.toString()
}

export const getSubCircuitName = (circuitId: number | null | undefined): string => {
  if (circuitId === null || circuitId === undefined) return '-'
  if (circuitId === -1) return 'Fracking'
  return circuitId.toString()
}

export const getMainCircuitFilterName = (
  circuitId: number,
  count: number
): string => {
  if (circuitId === -1) return `None/Fracking (${count})`
  return `Main ${circuitId} (${count})`
}

export const getSubCircuitFilterName = (
  circuitId: number,
  count: number
): string => {
  if (circuitId === -1) return `Fracking (${count})`
  return `Sub ${circuitId} (${count})`
}
