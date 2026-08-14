# Agregar videojuego a la biblioteca

## Objetivo

Permitir que un usuario autenticado busque un videojuego en IGDB y, en las siguientes fases, seleccione una edición y la incorpore a su biblioteca.

## Fase actual: búsqueda en IGDB

- La API consulta IGDB exclusivamente desde el backend y las credenciales nunca se entregan al cliente web.
- `GET /api/v1/games/search?q=<texto>` requiere una sesión válida.
- La búsqueda admite entre 2 y 100 caracteres después de eliminar sus espacios exteriores.
- Cada consulta devuelve como máximo diez videojuegos principales y excluye versiones o ediciones de los resultados iniciales.
- Cada resultado expone el identificador de IGDB, título, sinopsis, primera fecha de lanzamiento, portada y plataformas disponibles.
- La búsqueda no crea ni modifica registros en PostgreSQL.
- El token de acceso de Twitch se reutiliza hasta acercarse a su expiración.
- La ausencia de credenciales devuelve `503` y un fallo de Twitch o IGDB devuelve `502`, sin filtrar la respuesta interna del proveedor.

## Configuración

- `IGDB_CLIENT_ID` identifica la aplicación confidencial registrada en Twitch.
- `IGDB_CLIENT_SECRET` contiene su secreto y nunca se guarda en Git.

## Decisiones

- HTTPX `0.28.1` es la dependencia HTTP directa estable utilizada por el adaptador.
- La consulta de IGDB escapa el texto introducido, fija el límite de resultados y solicita únicamente los campos del contrato público.
- La respuesta externa se valida antes de convertirse al contrato de Gaido.
- La autenticación se centraliza como dependencia compartida para proteger esta ruta y las siguientes operaciones de biblioteca.

## Fuera de esta fase

- Persistencia de videojuegos o resultados de búsqueda.
- Selección y almacenamiento de plataformas, localizaciones o ediciones.
- Alta de la edición en la biblioteca del usuario.
- Conexión del buscador de la aplicación web.

## Verificación

- Los tests cubren autenticación obligatoria, transformación correcta de resultados, reutilización del token, validación de la consulta, configuración ausente, fallos del proveedor y respuestas externas inválidas.
- Las respuestas de prueba de Twitch e IGDB se simulan y no consumen peticiones ni requieren secretos reales.