# Resumen de videojuegos

## Objetivo

Ofrecer al usuario una entrada al área de Videojuegos con una visión rápida de su biblioteca, su progreso y la distribución de los formatos que posee.

## Comportamiento observable

- La ruta autenticada `/videojuegos` entra desde la derecha como una vista de pantalla completa y sustituye la cabecera global por una cabecera compacta con regreso a Inicio.
- El acceso de Videojuegos de la portada y el menú principal abren este resumen.
- La parte superior muestra el número total de entradas de biblioteca y el número de plataformas distintas.
- La tarjeta «Mis videojuegos» enlaza con `/biblioteca/videojuegos` y muestra las cinco entradas más recientes mediante sus portadas o un monograma alternativo; cada portada abre el detalle con esa entrada seleccionada.
- El gráfico de progreso agrupa `pending` y `playing` como «Por jugar», y `played` y `completed` como «Jugados».
- El gráfico de formato compara entradas físicas y digitales únicamente entre los videojuegos que el usuario posee.
- Una biblioteca vacía, una colección sin juegos en propiedad, la carga y los errores recuperables tienen estados explícitos.
- En móvil las secciones se apilan en una columna; desde 768 px los dos gráficos comparten fila.

## Contrato HTTP

- `GET /api/v1/library/games/statistics` devuelve `total_games`, `total_platforms`, `progress` y `formats` para el usuario autenticado.
- `GET /api/v1/library/games` proporciona las entradas usadas en la vista previa de «Mis videojuegos».
- Ambas operaciones requieren una sesión válida y solo consultan la biblioteca de ese usuario.

## Decisiones relevantes

- No se añaden tablas ni datos derivados persistentes: PostgreSQL calcula las estadísticas sobre `library_games` y sus ediciones mediante una consulta agregada.
- `total_games` cuenta entradas, no videojuegos únicos. La misma obra en dos plataformas representa dos videojuegos en la biblioteca.
- `total_platforms` cuenta plataformas distintas presentes en esas entradas.
- La distribución físico/digital ignora las entradas con `owned = false`.
- Recharts dibuja los anillos, pero los valores y etiquetas también existen como HTML accesible y no dependen exclusivamente del color.
- El router carga esta página de forma diferida para que Recharts no aumente el JavaScript inicial de Inicio o Autenticación.
- La vista separa composición, acceso a la biblioteca y gráfico reutilizable sin introducir una abstracción genérica para otros tipos de colección todavía inexistentes.
- La caché y los estados remotos se gestionan con TanStack Query; una mutación de la biblioteca invalida también las estadísticas por compartir la clave raíz.

## Verificación

- El backend cubre autenticación, biblioteca vacía y agregación de varias entradas, plataformas, estados, formatos y propiedad.
- El frontend cubre éxito, estados vacíos, carga, error recuperable, acceso a la biblioteca y valores accesibles de los gráficos.
- La integración de rutas verifica que el resumen oculta la cabecera global y conserva la navegación de regreso.
