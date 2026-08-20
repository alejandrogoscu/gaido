# Listado de biblioteca de videojuegos

## Objetivo

Permitir que el usuario consulte y filtre todas las ediciones guardadas en su biblioteca de videojuegos.

## Comportamiento observable

- La ruta autenticada `/biblioteca/videojuegos` entra desde la derecha como una vista de pantalla completa y permite volver a Inicio.
- Durante esta vista desaparece la cabecera global de Gaido y una cabecera oscura compacta muestra la flecha de regreso y el título «Mis videojuegos».
- Bajo la cabecera se presentan, en este orden, el buscador, los filtros y la cuadrícula.
- La vista es accesible desde el atajo de Videojuegos, la flecha de su resumen en Inicio y el menú principal.
- El buscador filtra inmediatamente por título dentro de la biblioteca ya cargada.
- Los filtros de plataforma, estado y propiedad pueden combinarse con el texto de búsqueda.
- Cada filtro se presenta como un botón, sin apariencia de `select`, y abre desde la derecha una vista de selección a pantalla completa con la opción activa identificada mediante un check cuadrado y un botón para aplicar el resultado.
- El control «Filtros» abre una vista global desde la que se consultan, modifican o borran conjuntamente los tres criterios antes de aplicarlos.
- Desde la vista global se puede entrar en cada criterio y regresar conservando temporalmente la selección; los cambios no alteran la cuadrícula hasta pulsar «Ver resultados».
- Las plataformas disponibles en el filtro se obtienen de las entradas de la biblioteca y se ordenan alfabéticamente.
- La cuadrícula representa una entrada por edición guardada, conserva su portada o un monograma alternativo y superpone la plataforma en una etiqueta turquesa.
- El listado comienza con dos columnas desde 320 px, utiliza tres desde 576 px y cuatro desde 768 px.
- La carga, el error recuperable, la biblioteca vacía y la ausencia de coincidencias tienen estados explícitos.

## Decisiones relevantes

- La vista reutiliza `GET /api/v1/library/games` y la caché de TanStack Query; no introduce un segundo contrato para los mismos datos.
- La búsqueda y los filtros se aplican en el cliente mientras el volumen de una biblioteca personal no justifique paginación ni filtrado remoto.
- Los controles conservan etiquetas accesibles y no dependen del color ni de la interacción mediante `hover`.
- Las vistas de filtros reutilizan el movimiento lateral de las demás vistas inmersivas, contienen el foco, admiten cierre mediante `Escape` y lo devuelven al control de origen.
- La ruta declara en su configuración que oculta la cabecera autenticada, de modo que futuras vistas inmersivas puedan reutilizar el comportamiento sin acoplar el layout a una URL concreta.
- Las tarjetas no enlazan todavía a una vista de detalle porque esa funcionalidad queda fuera del alcance actual.

## Verificación

- Los tests cubren el contenido de la cuadrícula, la selección directa, la edición y limpieza desde el panel global, la combinación de búsqueda y filtros, el estado vacío y el reintento tras un error.
- La integración de rutas comprueba que la cabecera global no permanece visible ni accesible dentro de la biblioteca.
- La navegación de Inicio mantiene Cómics deshabilitado y habilita únicamente la biblioteca disponible de Videojuegos.
