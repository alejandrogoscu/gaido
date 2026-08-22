import type { PlayStatus } from './types'

export const playStatusLabels: Record<PlayStatus, string> = {
  pending: 'Pendiente',
  playing: 'Jugando',
  played: 'Jugado',
  completed: 'Completado',
}
