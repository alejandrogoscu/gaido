export function gameDetailPath(
  igdbGameId: number,
  libraryGameId?: number | null,
): string {
  const path = `/videojuegos/${igdbGameId}`
  return libraryGameId ? `${path}?entrada=${libraryGameId}` : path
}
