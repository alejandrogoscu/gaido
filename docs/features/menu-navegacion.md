# Menú de navegación

## Objetivo

Ofrecer acceso mobile first a la navegación y a las acciones de sesión desde las vistas autenticadas.

## Comportamiento observable

- El botón de la cabecera abre un panel que entra desde la derecha y ocupa toda la altura visible.
- Una capa oscura separa visualmente el panel del contenido de la aplicación.
- El panel muestra primero el nombre visible y el correo del usuario, después las rutas disponibles y finalmente el cierre de sesión.
- Las tres zonas están separadas visualmente y el panel utiliza una superficie oscura con texto blanco.
- Inicio y el cierre del panel usan el turquesa al interactuar; cerrar sesión utiliza rojo para comunicar su carácter destructivo.
- El menú se cierra con su botón, al seleccionar una ruta, al pulsar fuera o mediante la tecla Escape.
- Mientras el panel está abierto se bloquea el desplazamiento del documento.
- Mientras el panel está abierto, la navegación mediante Tab permanece dentro de sus controles y al cerrarlo el foco vuelve al botón que lo abrió.
- El cierre de sesión mantiene sus estados de espera y error y solo abandona la vista autenticada cuando la API confirma la operación.

## Verificación

- La interfaz cubre apertura, contenido, navegación, cierre accesible y cierre de sesión.
- El panel conserva controles táctiles de al menos 44 px y elimina sus animaciones cuando el usuario prefiere movimiento reducido.
