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

## Alcance actual

- La autenticación mediante correo electrónico y contraseña será la primera funcionalidad de usuario.
- La biblioteca de videojuegos se implementará de nuevo después de la autenticación y pertenecerá al usuario autenticado.
- La verificación de correo, recuperación de contraseña y autenticación multifactor quedan fuera de la primera iteración.