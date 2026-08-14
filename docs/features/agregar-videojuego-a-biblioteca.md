# Agregar videojuego a la biblioteca

## Objetivo

Permitir que un usuario autenticado busque un videojuego en IGDB, seleccione una plataforma y añada una edición estándar a su biblioteca personal.

## Comportamiento observable

- El buscador de inicio admite entre 2 y 100 caracteres y solo consulta al enviar el formulario.
- La búsqueda muestra como máximo diez videojuegos principales con título, año, portada y plataformas disponibles.
- Cada resultado permite seleccionar una de sus plataformas y añadirla a la biblioteca.
- El alta correcta se confirma en el resultado y actualiza inmediatamente el resumen de Videojuegos.
- Una biblioteca vacía, la carga y los fallos de búsqueda, alta o listado tienen estados visibles.
- Añadir de nuevo la misma edición devuelve un conflicto comprensible y no duplica datos.
- Una edición guardada comienza con `owned = false` y `play_status = pending`.

## Contrato HTTP

- `GET /api/v1/games/search?q=<texto>` busca en IGDB y no persiste resultados.
- `GET /api/v1/library/games` devuelve únicamente la biblioteca del usuario autenticado.
- `POST /api/v1/library/games` recibe `igdb_game_id` e `igdb_platform_id` y devuelve la entrada creada con estado `201`.
- Las tres operaciones requieren una sesión válida.
- Una configuración ausente devuelve `503`; un fallo de Twitch o IGDB devuelve `502` sin filtrar detalles del proveedor.
- Un videojuego inexistente devuelve `404`, una plataforma ajena al videojuego devuelve `422` y una edición duplicada devuelve `409`.

## Persistencia

- El backend vuelve a consultar IGDB por identificador al guardar y no confía en los metadatos enviados por el cliente.
- El videojuego se identifica de forma única por `igdb_id` y conserva las fechas de sincronización y actualización del proveedor.
- El texto inglés de IGDB se guarda en `game_localizations` con configuración regional `en`.
- La plataforma se identifica de forma única por su identificador de IGDB.
- El alta crea o reutiliza una edición `standard`, de región `unknown`, para la plataforma y localización seleccionadas.
- La portada general conserva el identificador de imagen de IGDB; su URL se construye al responder.
- `library_games` impide que un usuario añada dos veces la misma edición y permanece separada del catálogo compartido.
- La migración `20260814_0003` crea las tablas y restricciones de esta fase.

## Decisiones relevantes

- IGDB se consulta exclusivamente desde el backend mediante HTTPX y sus credenciales nunca llegan al cliente web.
- El token de Twitch se reutiliza hasta acercarse a su expiración.
- TanStack Query gestiona búsqueda, alta, listado e invalidación de la biblioteca en el frontend.
- Esta fase no inventa región, traducción ni una edición externa que IGDB no haya proporcionado.

## Fuera de alcance

- Ediciones regionales, de coleccionista o deluxe identificadas de forma independiente.
- Portadas específicas de edición, géneros, clasificaciones por edad e idiomas soportados.
- Traducciones, actualización programada del catálogo y combinación de búsqueda local con IGDB.
- Modificación de propiedad o estado de juego, eliminación y página completa de biblioteca.

## Verificación

- El backend cubre autenticación, búsqueda, transformación del proveedor, alta, listado, valores iniciales, duplicados, plataformas inválidas y fallos externos.
- El frontend cubre biblioteca vacía, búsqueda, selección de plataforma, alta, actualización del resumen y errores remotos.
- Twitch e IGDB se simulan en los tests y la persistencia utiliza PostgreSQL efímero y aislado.