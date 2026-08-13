# Autenticación

## Objetivo

Permitir la creación de cuentas y el acceso seguro mediante correo electrónico y contraseña desde la API y la aplicación web.

## Comportamiento observable

- El registro solicita correo electrónico, nombre de usuario y contraseña.
- Un registro correcto crea una sesión automáticamente.
- El inicio de sesión utiliza exclusivamente correo electrónico y contraseña.
- La sesión actual permite consultar la identidad autenticada.
- El cierre de sesión elimina inmediatamente la sesión actual.
- Un nuevo acceso desde el mismo navegador sustituye su sesión anterior sin cerrar las sesiones de otros dispositivos.
- Una sesión expira de forma absoluta a los siete días y se elimina cuando se intenta utilizar después de expirar.
- Los conflictos de correo o nombre de usuario devuelven un mensaje común.
- Un correo inexistente y una contraseña incorrecta producen la misma respuesta de autenticación.

## API

| Método | Ruta | Resultado |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Crea el usuario, inicia sesión y devuelve `201`. |
| `POST` | `/api/v1/auth/login` | Inicia una sesión y devuelve el usuario. |
| `GET` | `/api/v1/auth/me` | Devuelve el usuario autenticado o `401`. |
| `POST` | `/api/v1/auth/logout` | Elimina la sesión actual y devuelve `204`. |

Registro recibe `email`, `username` y `password`. Login recibe `email` y `password`. Las respuestas públicas del usuario contienen `id`, `email`, `username`, `display_name` y `created_at`; nunca incluyen el hash de contraseña.

## Identidad

- El correo se valida y almacena normalizado para usarlo como identificador de acceso único.
- El nombre introducido se normaliza mediante Unicode NFKC y se recortan sus espacios exteriores.
- `username` guarda la versión normalizada sin distinción de mayúsculas y minúsculas.
- `display_name` conserva la escritura visible introducida por el usuario.
- Un nombre de usuario admite entre 3 y 20 caracteres ASCII: letras, números, guion y guion bajo.
- Una contraseña admite entre 12 y 128 caracteres.

## Interfaz web

- Al cargar la aplicación se consulta la sesión actual antes de mostrar el formulario o el contenido autenticado.
- El inicio de sesión y el registro tienen rutas públicas independientes: `/login` y `/register`.
- El acceso solicita exclusivamente correo electrónico y contraseña.
- Acceso y registro muestran siempre un título y una descripción breve dentro del mismo espacio visual para evitar saltos al navegar entre ellos.
- El registro solicita nombre de usuario, correo electrónico, contraseña y su confirmación.
- La confirmación debe coincidir antes de enviar el formulario y no se transmite ni se persiste.
- El registro muestra un check cuando el nombre de usuario cumple su formato y cuando el correo tiene un formato válido.
- Cada campo de contraseña permite mostrar u ocultar su contenido de forma independiente y permanece oculto por defecto.
- Registro e inicio de sesión actualizan inmediatamente la interfaz con el usuario devuelto por la API.
- El cliente envía la cookie de sesión en todas las solicitudes de autenticación sin acceder a su contenido.
- Los errores de validación o credenciales se muestran junto al formulario y los controles se desactivan durante cada envío.
- Un error al consultar la sesión muestra una acción de reintento; una respuesta `401` muestra el acceso como estado normal.
- El cierre de sesión solo devuelve a la pantalla de acceso cuando la API confirma que la sesión ha sido eliminada.
- Las rutas públicas usan una cabecera con logo y claim; las rutas autenticadas sustituyen el claim por un menú con la identidad y el cierre de sesión.
- La pantalla mantiene una sola columna desde 320 px bajo una cabecera horizontal.

## Seguridad

- Las contraseñas se protegen con Argon2id mediante `argon2-cffi`; el hash contiene su salt y parámetros.
- La verificación de un usuario inexistente realiza igualmente una operación de hash para reducir diferencias temporales observables.
- Cada identificador de sesión contiene entropía criptográfica y PostgreSQL conserva únicamente su hash SHA-256.
- La cookie de sesión usa `HttpOnly`, `SameSite=Lax` y `Path=/`; `Secure` se activa mediante configuración en entornos HTTPS.
- Las respuestas de autenticación no se almacenan en caché.
- Un usuario puede mantener sesiones independientes en varios dispositivos.

## Persistencia

- `users` contiene la identidad y las credenciales protegidas.
- `user_sessions` contiene sesiones revocables asociadas a un usuario.
- Eliminar un usuario elimina también todas sus sesiones.
- `expires_at` está indexado para permitir una futura limpieza periódica sin modificar el modelo.

## Fuera de alcance

- Verificación de correo y recuperación de contraseña.
- MFA, roles y permisos.
- Renovación automática de sesiones y opción «recordarme».
- Gestión de dispositivos o cierre remoto de otras sesiones.

## Verificación

- Los tests usan una base PostgreSQL temporal e independiente.
- Se cubren registro, normalización y formato del nombre de usuario, hash, conflictos, longitud de contraseña, login, errores genéricos, sesión automática, expiración y logout.
- La interfaz cubre sesión inexistente, navegación entre login y registro, visibilidad y confirmación de contraseña, autenticación, credenciales incorrectas, restauración de sesión, menú autenticado, logout y reintento tras un error de conexión.
- Alembic crea las restricciones, claves foráneas e índices definidos por los modelos SQLAlchemy.