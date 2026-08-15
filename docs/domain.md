# Dominio de Gaido

Este documento describe el comportamiento funcional vigente de Gaido. Debe evolucionar junto con el producto y sus tests.

## Cuenta de usuario

- Una cuenta se identifica internamente mediante un identificador autoincrementable.
- El correo electrónico es obligatorio, único, se almacena normalizado y es el único identificador permitido para iniciar sesión.
- `username` es obligatorio, está normalizado y es único sin distinguir mayúsculas y minúsculas.
- `display_name` conserva la escritura visible del nombre introducido al registrarse.
- El nombre de usuario admite entre 3 y 20 caracteres ASCII: letras, números, guion y guion bajo.
- La contraseña nunca se almacena en texto plano; únicamente se conserva un hash adecuado para contraseñas.
- La contraseña admite entre 12 y 128 caracteres.
- Un registro correcto inicia automáticamente la sesión del nuevo usuario.

## Sesión de usuario

- Una cuenta puede mantener varias sesiones para permitir el acceso desde distintos dispositivos.
- El cliente conserva el identificador de sesión en una cookie inaccesible desde JavaScript y la base de datos guarda únicamente su hash.
- Cada sesión expira de forma absoluta a los siete días y no se renueva automáticamente con el uso.
- El cierre de sesión elimina inmediatamente la sesión actual.
- Las sesiones expiradas se rechazan y eliminan cuando se intentan utilizar.

## Catálogo de videojuegos

- Un videojuego representa la obra general y permanece separado de sus plataformas, regiones, ediciones y datos personales de biblioteca.
- IGDB es la única fuente externa inicial del catálogo y siempre se consulta desde el backend.
- El identificador autoincrementable de Gaido es la identidad interna principal del videojuego.
- El identificador de IGDB es una referencia externa única que permite importar y actualizar sus datos sin duplicarlo, pero no sustituye a la identidad interna.
- El catálogo local conserva únicamente los videojuegos seleccionados por algún usuario; los resultados de búsqueda no se importan de forma masiva.
- Una búsqueda cruza los resultados de IGDB con el catálogo local mediante el identificador externo y devuelve el identificador interno cuando el videojuego ya está importado.
- La búsqueda identifica si el videojuego y cada una de sus plataformas ya forman parte de la biblioteca del usuario autenticado.
- Consultar IGDB incluso para un videojuego ya importado permite descubrir cambios posteriores como nuevas plataformas; una futura política de caché podrá evitar llamadas recientes sin cambiar el contrato.
- Cada videojuego conserva la información necesaria para determinar cuándo se sincronizó y si IGDB dispone de una versión más reciente.

## Localización del catálogo

- El título y la sinopsis se almacenan por videojuego y configuración regional mediante códigos como `es-ES`, `en-GB` o `it-IT`.
- Una localización pertenece a un único videojuego y la combinación de videojuego y configuración regional es única.
- El título es obligatorio en cada localización y la sinopsis puede estar ausente.
- No se crean columnas específicas por idioma como `title_es` o `summary_en`.
- La región comercial de una edición y el idioma de sus metadatos son conceptos diferentes y no se deducen entre sí.
- Una edición referencia explícitamente una localización existente del mismo videojuego.
- Cuando un texto no exista en la localización exacta se aplica la cadena de respaldo: configuración regional solicitada, idioma base e inglés.
- IGDB no garantiza sinopsis traducidas para todas las localizaciones; el modelo debe admitir que una futura fuente de traducción complete esos datos sin alterar el catálogo principal.

## Plataformas y ediciones

- Una edición representa la variante concreta de un videojuego que puede añadirse a una biblioteca.
- Cada edición pertenece a un videojuego y una plataforma e identifica su tipo, nombre, región comercial, localización visible y fecha de lanzamiento cuando se conozca.
- La edición estándar, las ediciones coleccionista o deluxe y sus variantes por plataforma o región son entradas diferentes.
- La combinación de videojuego, plataforma, tipo, región y localización identifica de forma única una edición.
- Una edición no utiliza un identificador externo mientras IGDB no proporcione un registro que represente de forma fiable esa edición concreta.
- Se permite el mismo videojuego en varias plataformas, regiones y ediciones.
- La región puede ser específica, regional, mundial o desconocida; no obliga por sí sola a utilizar un idioma concreto.
- Los tipos de edición y las regiones se mantienen inicialmente como valores normalizados, sin catálogos persistentes independientes.

## Portadas

- Un videojuego puede tener una portada general y cada edición puede tener sus propias portadas.
- Solo puede existir una portada principal general por videojuego y una portada principal por edición.
- Para mostrar una edición se utiliza primero su portada principal, después la portada general del videojuego y finalmente el recurso provisional de Gaido.
- Se conserva el identificador de imagen de IGDB necesario para construir la URL de la portada, sin guardar una respuesta opaca completa del proveedor.
- El modelo admite futuras portadas de otras regiones o ediciones, incluidas las ediciones coleccionista.

## Géneros

- Un videojuego puede tener varios géneros y un género puede pertenecer a varios videojuegos.
- Cada género procedente de IGDB se identifica de forma única mediante su identificador externo.
- El nombre de un género se almacena por configuración regional para poder mostrarlo en distintos idiomas sin duplicar el género.

## Clasificaciones por edad

- Una edición puede tener una o varias clasificaciones por edad emitidas por organizaciones como PEGI, ESRB o CERO.
- Las clasificaciones se normalizan y se relacionan con las ediciones, evitando repetir su definición en cada videojuego.
- En la primera iteración se conserva la organización y la categoría de edad; los descriptores de contenido quedan fuera de alcance.

## Idiomas soportados

- Los idiomas soportados por un videojuego no determinan el idioma visible de su título o sinopsis.
- Una edición puede relacionarse con varios idiomas soportados.
- Para cada idioma se distingue si está disponible como audio, subtítulos o interfaz.
- La combinación de edición, idioma y tipo de soporte es única.

## Biblioteca de videojuegos

- La biblioteca pertenece siempre al usuario autenticado.
- Una entrada de biblioteca referencia una edición concreta y obtiene de ella el videojuego, la plataforma, la región, la localización y la portada aplicables.
- Un usuario no puede añadir dos veces la misma edición a su biblioteca.
- `media_format` pertenece a la entrada personal y requiere elegir `physical` o `digital`.
- El mismo videojuego puede guardarse en plataformas diferentes y cada entrada puede tener su propio formato; cambiar únicamente el formato no permite duplicar una misma edición.
- `owned` indica si el usuario posee la edición y su valor inicial es `false`.
- `play_status` admite `pending`, `playing`, `played` y `completed`, con `pending` como valor inicial.
- `played` significa que se ha jugado, no necesariamente que se haya completado.
- `completed` significa que el usuario considera completado el videojuego.
- La propiedad de la edición y su estado de juego son conceptos independientes.
- La gestión de varias copias idénticas de una misma edición queda fuera del alcance inicial.
- En la primera alta desde IGDB, el usuario elige una de las plataformas devueltas por el proveedor, el formato de su entrada, su propiedad y su estado de juego.
- Mientras no se importen versiones regionales específicas, el alta crea o reutiliza una edición estándar de región desconocida y localización inglesa.
- Los datos recibidos del navegador no se consideran fuente del catálogo: el backend vuelve a consultar el videojuego por su identificador de IGDB antes de persistirlo.

## Alcance actual

- La autenticación mediante correo electrónico y contraseña constituye la base de acceso a las funcionalidades personales.
- La búsqueda en IGDB y el alta de una edición estándar en la biblioteca están disponibles para el usuario autenticado.
- La persistencia actual incluye videojuegos, localizaciones inglesas, plataformas, ediciones estándar, portadas generales y entradas de biblioteca.
- Los géneros, clasificaciones por edad, idiomas soportados, ediciones regionales y portadas específicas se incorporarán cuando sus respectivos flujos los necesiten.
- Otras fuentes externas, traducción automática, varias copias de una edición y otros tipos de colección quedan fuera de esta iteración.
- La verificación de correo, recuperación de contraseña y autenticación multifactor siguen fuera del alcance actual.
