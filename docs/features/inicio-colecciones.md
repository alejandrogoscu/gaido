# Inicio de colecciones

## Objetivo

Definir visualmente una portada autenticada que permita descubrir y acceder a las distintas colecciones del usuario sin acoplarla todavía a contratos de backend inexistentes.

## Comportamiento observable

- La primera zona visible contiene un buscador global preparado para abarcar todas las colecciones.
- El buscador permanece centrado horizontalmente en cualquier tamaño de pantalla.
- El buscador permanece deshabilitado hasta implementar una búsqueda real.
- Entre el buscador y los resúmenes aparecen accesos visuales centrados para Videojuegos y Cómics, con fondo turquesa, símbolos blancos y nombres accesibles sin texto visible; permanecen deshabilitados hasta que existan sus bibliotecas.
- Los accesos y demás acciones de la portada utilizan Remix Icon para compartir el mismo lenguaje visual que el resto de la aplicación.
- Inicio muestra resúmenes independientes de Videojuegos y Cómics con tres elementos de demostración cada uno.
- Cada resumen se identifica mediante un único título compacto, sin subtítulos redundantes.
- Cada resumen prepara una acción «Ver todos» representada por una flecha visible y con nombre accesible, deshabilitada hasta que exista la ruta de biblioteca correspondiente.
- En móvil, los elementos se recorren horizontalmente con controles táctiles y sin depender de hover.
- La barra nativa permanece oculta para integrar el carrusel en el diseño sin impedir su desplazamiento.
- El desplazamiento horizontal queda contenido dentro de cada colección y no aumenta el ancho de la página ni de la cabecera.
- Desde 768 px, cada resumen se distribuye en una cuadrícula de tres columnas.
- Los datos de demostración están aislados del componente y no representan persistencia ni un contrato de dominio.
- La estructura permite añadir en el futuro películas, libros o música sin modificar el componente de presentación.

## Alcance

- Esta iteración es exclusivamente visual y no realiza peticiones de colecciones al backend.
- No incluye búsqueda, páginas de biblioteca, detalles, imágenes reales ni estados personales de los elementos.

## Verificación

- La interfaz se comprueba desde 320 px y adapta su distribución a escritorio mediante `min-width`.
- Los títulos de las colecciones, sus elementos de muestra y los controles todavía no disponibles se exponen de forma semántica.
