# Agregar videojuego a la biblioteca

## Objetivo

Permitir que un usuario autenticado configure y añada una edición de un videojuego de IGDB a su biblioteca personal.

## Comportamiento observable

- El buscador de inicio admite entre 2 y 100 caracteres y solo consulta al enviar el formulario.
- La búsqueda muestra como máximo diez videojuegos con título, año, portada y plataformas disponibles.
- Los resultados se ordenan priorizando el juego principal y sus remakes por año más reciente, después los DLC y por último el resto de categorías, también por año más reciente.
- Cada resultado abre mediante `+` un panel lateral que entra desde la derecha y mantiene visible la búsqueda bajo un fondo atenuado.
- El control `+` conserva un área táctil mínima de 44 por 44 px; mientras el panel está abierto, el foco permanece dentro y vuelve al control al cerrarlo.
- El panel permite elegir plataforma, propiedad, formato físico o digital y estado pendiente, jugando, jugado o completado.
- Los nombres acompañan a los logos dentro del panel para distinguir plataformas de una misma familia.
- El control `+` se oculta cuando todas las plataformas disponibles ya están en la biblioteca; permanece accesible si todavía puede añadirse otra plataforma del mismo videojuego.
- El alta correcta cierra únicamente el panel, mantiene abierta la búsqueda y actualiza inmediatamente el resumen de Videojuegos.
- Una biblioteca vacía, la carga y los fallos de búsqueda, alta o listado tienen estados visibles.
- Añadir de nuevo la misma edición devuelve un conflicto comprensible y no duplica datos.
- Los resultados indican si el videojuego está en la biblioteca y qué plataformas concretas ya se han añadido.
- Una plataforma ya añadida queda deshabilitada, pero el mismo videojuego puede configurarse para cualquiera de sus otras plataformas.
- El panel comienza con `owned = false`, formato físico y `play_status = pending`; la plataforma debe elegirse expresamente.

## Contrato HTTP

- `GET /api/v1/games/search?q=<texto>` busca en IGDB, cruza el resultado con la biblioteca y no persiste nuevos resultados.
- Cada resultado de búsqueda devuelve `game_id` cuando ya existe en Gaido, indicadores `in_library` para el videojuego y sus plataformas, y `owned` cuando el usuario posee alguna entrada de ese videojuego.
- Cada resultado de búsqueda incluye `category` con la categoría normalizada de IGDB (`main_game`, `remake`, `dlc_addon`...), usada para ordenar la respuesta; puede ser `null` si IGDB no la proporciona.
- `GET /api/v1/library/games` devuelve únicamente la biblioteca del usuario autenticado.
- `POST /api/v1/library/games` recibe `igdb_game_id`, `igdb_platform_id`, `media_format`, `owned` y `play_status`, y devuelve la entrada creada con estado `201`.
- Las tres operaciones requieren una sesión válida.
- Una configuración ausente devuelve `503`; un fallo de Twitch o IGDB devuelve `502` sin filtrar detalles del proveedor.
- Un videojuego inexistente devuelve `404`, una plataforma ajena al videojuego devuelve `422` y una edición duplicada devuelve `409`.

## Persistencia

- El backend vuelve a consultar IGDB por identificador al guardar y no confía en los metadatos enviados por el cliente.
- El videojuego utiliza un identificador propio de Gaido; `igdb_id` es una referencia externa única para sincronizar el proveedor sin duplicados.
- `games.category` guarda la categoría normalizada de IGDB (juego principal, remake, remaster, port, DLC, bundle...); es `NULL` cuando IGDB no la expone.
- El texto inglés de IGDB se guarda en `game_localizations` con configuración regional `en`.
- La plataforma se identifica de forma única por su identificador de IGDB.
- El alta crea o reutiliza una edición `standard`, de región `unknown`, para la plataforma y localización seleccionadas.
- Una edición se identifica por videojuego, plataforma, tipo, región y localización; no conserva un identificador de edición de IGDB mientras el proveedor no ofrezca esa identidad de forma fiable.
- `media_format`, `owned` y `play_status` pertenecen a la entrada personal; el formato admite físico o digital y `completed` se diferencia de `played`.
- La portada general conserva el identificador de imagen de IGDB; su URL se construye al responder.
- `library_games` impide que un usuario añada dos veces la misma edición y permanece separada del catálogo compartido.
- La migración `20260814_0003` crea las tablas y restricciones de esta fase, incluido el formato en `library_games`.
- La migración `20260815_0004` incorpora el estado completado.
- La migración `20260817_0005` añade `games.category`.

## Decisiones relevantes

- IGDB se consulta exclusivamente desde el backend mediante HTTPX y sus credenciales nunca llegan al cliente web.
- El token de Twitch se reutiliza hasta acercarse a su expiración.
- TanStack Query gestiona búsqueda, alta, listado e invalidación de la biblioteca en el frontend.
- Esta fase no inventa región, traducción ni una identidad externa de edición que IGDB no haya proporcionado.

## Fuera de alcance

- Ediciones regionales, de coleccionista o deluxe identificadas de forma independiente.
- Portadas específicas de edición, géneros, clasificaciones por edad e idiomas soportados.
- Traducciones, actualización programada del catálogo y combinación de búsqueda local con IGDB.
- Modificación posterior de propiedad, formato o estado de juego, eliminación y página completa de biblioteca.

## Verificación

- El backend cubre autenticación, búsqueda enriquecida con la biblioteca, transformación del proveedor, ordenación de resultados por categoría y fecha, configuración del alta, formatos por entrada, listado, duplicados, plataformas distintas, plataformas inválidas y fallos externos.
- El frontend cubre biblioteca vacía, búsqueda, identificación de plataformas añadidas, apertura y cierre del panel, configuración completa, alta, permanencia de la búsqueda y actualización del resumen.
- Twitch e IGDB se simulan en los tests y la persistencia utiliza PostgreSQL efímero y aislado.
