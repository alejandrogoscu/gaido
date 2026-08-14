# Inicio de colecciones

## Objetivo

Ofrecer una portada autenticada que permita buscar elementos y resumir las distintas colecciones del usuario.

## Comportamiento observable

- La primera zona visible contiene un buscador que consulta actualmente el catálogo de videojuegos.
- El buscador permanece centrado horizontalmente en cualquier tamaño de pantalla.
- La búsqueda se ejecuta al enviar el formulario y muestra sus resultados sin abandonar Inicio.
- Entre el buscador y los resúmenes aparecen accesos visuales centrados para Videojuegos y Cómics, con fondo turquesa, símbolos blancos y nombres accesibles sin texto visible; permanecen deshabilitados hasta que existan sus bibliotecas.
- Los accesos y demás acciones de la portada utilizan Remix Icon para compartir el mismo lenguaje visual que el resto de la aplicación.
- Inicio muestra resúmenes independientes de Videojuegos y Cómics.
- Videojuegos carga hasta las tres entradas más recientes de la biblioteca real y trata los estados de carga, vacío y error.
- Cómics mantiene tres elementos de demostración hasta que exista su funcionalidad vertical.
- Cada resumen se identifica mediante un único título compacto, sin subtítulos redundantes.
- Cada resumen prepara una acción «Ver todos» representada por una flecha visible y con nombre accesible, deshabilitada hasta que exista la ruta de biblioteca correspondiente.
- En móvil, los elementos se recorren horizontalmente con controles táctiles y sin depender de hover.
- La barra nativa permanece oculta para integrar el carrusel en el diseño sin impedir su desplazamiento.
- El desplazamiento horizontal queda contenido dentro de cada colección y no aumenta el ancho de la página ni de la cabecera.
- Desde 768 px, cada resumen se distribuye en una cuadrícula de tres columnas.
- Los datos de demostración de Cómics están aislados y no representan persistencia ni un contrato de dominio.
- La estructura permite añadir en el futuro películas, libros o música sin modificar el componente de presentación.

## Alcance

- Videojuegos está conectado al backend para búsqueda, alta y resumen de biblioteca.
- No incluye todavía páginas completas de biblioteca, detalles ni persistencia de Cómics.

## Verificación

- La interfaz se comprueba desde 320 px y adapta su distribución a escritorio mediante `min-width`.
- Los títulos, estados remotos, resultados y controles todavía no disponibles se exponen de forma semántica.