# Agregar videojuego a la biblioteca

## Objetivo

Permitir que un usuario autenticado configure y añada una edición de un videojuego de IGDB a su biblioteca personal.

## Comportamiento observable

- El buscador de inicio admite entre 2 y 100 caracteres y solo consulta al enviar el formulario.
- La búsqueda muestra como máximo diez videojuegos principales con título, año, portada y plataformas disponibles.
- Cada resultado abre mediante `+` un panel lateral que entra desde la derecha y mantiene visible la búsqueda bajo un fondo atenuado.
- El panel permite elegir plataforma, propiedad, formato físico o digital y estado pendiente, jugando, jugado o completado.
- Los nombres acompañan a los logos dentro del panel para distinguir plataformas de una misma familia.
- El alta correcta cierra únicamente el panel, mantiene abierta la búsqueda y actualiza inmediatamente el resumen de Videojuegos.
- Una biblioteca vacía, la carga y los fallos de búsqueda, alta o listado tienen estados visibles.
- Añadir de nuevo la misma edición devuelve un conflicto comprensible y no duplica datos.
- El panel comienza con `owned = false`, formato físico y `play_status = pending`; la plataforma debe elegirse expresamente.

## Contrato HTTP

- `GET /api/v1/games/search?q=<texto>` busca en IGDB y no persiste resultados.
- `GET /api/v1/library/games` devuelve únicamente la biblioteca del usuario autenticado.
- `POST /api/v1/library/games` recibe `igdb_game_id`, `igdb_platform_id`, `media_format`, `owned` y `play_status`, y devuelve la entrada creada con estado `201`.
- Las tres operaciones requieren una sesión válida.
- Una configuración ausente devuelve `503`; un fallo de Twitch o IGDB devuelve `502` sin filtrar detalles del proveedor.
- Un videojuego inexistente devuelve `404`, una plataforma ajena al videojuego devuelve `422` y una edición duplicada devuelve `409`.

## Persistencia

- El backend vuelve a consultar IGDB por identificador al guardar y no confía en los metadatos enviados por el cliente.
- El videojuego se identifica de forma única por `igdb_id` y conserva las fechas de sincronización y actualización del proveedor.
- El texto inglés de IGDB se guarda en `game_localizations` con configuración regional `en`.
- La plataforma se identifica de forma única por su identificador de IGDB.
- El alta crea o reutiliza una edición `standard`, de región `unknown`, para la plataforma, formato y localización seleccionados.
- `media_format` pertenece a la edición y admite `physical`, `digital` y el valor interno `unknown` para datos anteriores; las altas nuevas solo aceptan físico o digital.
- `owned` y `play_status` pertenecen a la entrada personal; `completed` se diferencia de `played`.
- La portada general conserva el identificador de imagen de IGDB; su URL se construye al responder.
- `library_games` impide que un usuario añada dos veces la misma edición y permanece separada del catálogo compartido.
- La migración `20260814_0003` crea las tablas y restricciones de esta fase.
- La migración `20260815_0004` incorpora el formato de edición y el estado completado sin borrar las entradas existentes.

## Decisiones relevantes

- IGDB se consulta exclusivamente desde el backend mediante HTTPX y sus credenciales nunca llegan al cliente web.
- El token de Twitch se reutiliza hasta acercarse a su expiración.
- TanStack Query gestiona búsqueda, alta, listado e invalidación de la biblioteca en el frontend.
- Esta fase no inventa región, traducción ni una edición externa que IGDB no haya proporcionado.

## Fuera de alcance

- Ediciones regionales, de coleccionista o deluxe identificadas de forma independiente.
- Portadas específicas de edición, géneros, clasificaciones por edad e idiomas soportados.
- Traducciones, actualización programada del catálogo y combinación de búsqueda local con IGDB.
- Modificación posterior de propiedad, formato o estado de juego, eliminación y página completa de biblioteca.

## Verificación

- El backend cubre autenticación, búsqueda, transformación del proveedor, configuración del alta, formatos independientes, listado, duplicados, plataformas inválidas y fallos externos.
- El frontend cubre biblioteca vacía, búsqueda, apertura y cierre del panel, configuración completa, alta, permanencia de la búsqueda y actualización del resumen.
- Twitch e IGDB se simulan en los tests y la persistencia utiliza PostgreSQL efímero y aislado.