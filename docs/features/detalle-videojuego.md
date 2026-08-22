# Detalle de videojuego

## Objetivo

Presentar un videojuego del catálogo tanto si forma parte de la biblioteca del usuario como si todavía no existe una relación personal con él.

## Comportamiento observable

- La ruta autenticada `/videojuegos/:igdbGameId` entra desde la derecha y sustituye la cabecera global por una cabecera compacta de navegación.
- La flecha regresa al punto desde el que se abrió el detalle; un acceso directo utiliza el resumen de Videojuegos como destino seguro.
- Se puede abrir desde un resultado de búsqueda, la cuadrícula «Mis videojuegos», una portada de Inicio o una portada del resumen de Videojuegos.
- La parte superior muestra el título a la izquierda y la portada a la derecha.
- Sin una entrada personal seleccionada se muestran como texto todas las plataformas disponibles y se omiten la propiedad y el estado.
- Con una entrada personal se muestra únicamente su plataforma y su estado.
- Una entrada poseída muestra «Lo tengo». Una entrada no poseída muestra «No lo tengo» si está jugando, jugada o completada, y no muestra texto de propiedad si está pendiente.
- La sinopsis aparece debajo y tiene un estado alternativo cuando no está disponible.
- La sección «Ratings» comunica que aún no existen valoraciones sin inventar una puntuación.
- Editar, Compartir y Eliminar permanecen deshabilitados hasta definir sus reglas y comportamiento.
- La carga, el error recuperable y el videojuego inexistente tienen estados explícitos.

## Contrato HTTP

- `GET /api/v1/games/{igdbGameId}` devuelve los datos actuales de IGDB y todas sus plataformas sin persistir el resultado.
- El parámetro opcional `library_game_id` añade el contexto de una entrada perteneciente al usuario autenticado.
- Una entrada inexistente, ajena o correspondiente a otro videojuego devuelve `404` sin exponer datos personales.
- La búsqueda devuelve `library_game_id` cuando reconoce una entrada personal para poder conservarla al navegar.

## Decisiones relevantes

- La referencia de IGDB permite abrir juegos todavía no importados; no reemplaza el identificador interno como identidad principal del catálogo persistido.
- La URL usa `entrada` como parámetro opcional y la API usa `library_game_id`; así el videojuego general y la relación personal permanecen separados.
- Los cuatro puntos de acceso comparten una sola ruta y una sola página, evitando duplicar detalles de catálogo y biblioteca.
- La selección entre varias entradas personales del mismo videojuego queda fuera de esta iteración; los enlaces actuales conservan la entrada concreta de la portada y la búsqueda utiliza una única coincidencia.
- No se añaden tablas ni campos persistentes.

## Verificación

- El backend cubre detalle general, contexto personal seleccionado, autenticación, videojuego inexistente y aislamiento entre usuarios.
- El frontend cubre detalle general, propiedad condicional, estado pendiente, ausencia de sinopsis, carga, entrada inexistente y reintento.
- Las pruebas de Inicio, biblioteca, resumen y rutas comprueban los enlaces y la ausencia de la cabecera global.
