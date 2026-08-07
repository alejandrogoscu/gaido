# Dominio de Gaido

Este documento describe el comportamiento funcional vigente de Gaido. Debe evolucionar junto con el producto y sus tests.

## Conceptos principales

### Videojuego

Representa la información propia del juego y no contiene datos personales del usuario.

- El título es obligatorio.
- La plataforma es opcional y se representa inicialmente como texto libre.
- Un mismo título puede existir en plataformas diferentes.

### Entrada de biblioteca

Relaciona un videojuego con la biblioteca personal y contiene la información específica del usuario.

- La propiedad y el estado de juego son conceptos independientes.
- `owned` indica si el usuario posee el juego.
- `play_status` indica su situación de juego actual.

## Estados de juego

| Valor | Significado |
| --- | --- |
| `pending` | El usuario lo tiene pendiente. |
| `playing` | El usuario lo está jugando actualmente. |
| `played` | El usuario lo ha jugado, sin implicar necesariamente que lo haya completado. |

Los valores iniciales de una entrada son `owned = false` y `play_status = pending`.

## Normalización y duplicados

- Eliminar los espacios exteriores del título y la plataforma antes de comparar o guardar sus valores normalizados.
- Comparar título y plataforma sin distinguir mayúsculas y minúsculas para detectar duplicados.
- Rechazar una entrada con el mismo título y plataforma que otra ya existente.
- Permitir entradas con el mismo título cuando la plataforma sea diferente.

## Alcance actual

- La aplicación funciona para un solo usuario.
- La autenticación y las bibliotecas de varios usuarios quedan fuera del alcance hasta que se implementen explícitamente.
- Carátulas, valoraciones, notas, edición y eliminación no forman parte de la primera funcionalidad de añadir y listar juegos.
