# Listado de biblioteca de videojuegos

## Objetivo

Permitir que el usuario consulte y filtre todas las ediciones guardadas en su biblioteca de videojuegos.

## Comportamiento observable

- La ruta autenticada `/biblioteca/videojuegos` muestra el título «Mis videojuegos» y permite volver a Inicio.
- La vista es accesible desde el atajo de Videojuegos, la flecha de su resumen en Inicio y el menú principal.
- El buscador filtra inmediatamente por título dentro de la biblioteca ya cargada.
- Los filtros de plataforma, estado y propiedad pueden combinarse con el texto de búsqueda.
- Las plataformas disponibles en el filtro se obtienen de las entradas de la biblioteca y se ordenan alfabéticamente.
- La cuadrícula representa una entrada por edición guardada, conserva su portada o un monograma alternativo y superpone la plataforma en una etiqueta turquesa.
- El listado comienza con dos columnas desde 320 px, utiliza tres desde 576 px y cuatro desde 768 px.
- La carga, el error recuperable, la biblioteca vacía y la ausencia de coincidencias tienen estados explícitos.

## Decisiones relevantes

- La vista reutiliza `GET /api/v1/library/games` y la caché de TanStack Query; no introduce un segundo contrato para los mismos datos.
- La búsqueda y los filtros se aplican en el cliente mientras el volumen de una biblioteca personal no justifique paginación ni filtrado remoto.
- Los controles conservan etiquetas accesibles y no dependen del color ni de la interacción mediante `hover`.
- Las tarjetas no enlazan todavía a una vista de detalle porque esa funcionalidad queda fuera del alcance actual.

## Verificación

- Los tests cubren el contenido de la cuadrícula, la combinación de búsqueda y filtros, el estado vacío y el reintento tras un error.
- La navegación de Inicio mantiene Cómics deshabilitado y habilita únicamente la biblioteca disponible de Videojuegos.