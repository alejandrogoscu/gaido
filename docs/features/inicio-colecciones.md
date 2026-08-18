# Inicio de colecciones

## Objetivo

Ofrecer una portada autenticada que permita buscar elementos y resumir las distintas colecciones del usuario.

## Comportamiento observable

- La primera zona visible contiene un buscador que consulta actualmente el catálogo de videojuegos.
- El buscador permanece centrado horizontalmente en cualquier tamaño de pantalla.
- La búsqueda se ejecuta con Intro al enviar el formulario y muestra sus resultados sin abandonar Inicio, sin duplicar una lupa dentro de la cabecera activa.
- Al activar el buscador se abre una vista de altura completa que entra desde la derecha, bloquea el desplazamiento de Inicio y enfoca el campo automáticamente.
- Mientras la búsqueda está abierta, la navegación mediante Tab permanece dentro de su vista.
- Al cerrar la vista, se limpia la consulta y el foco vuelve al botón que abre la búsqueda sin activarla de nuevo.
- Tras enviar la consulta, la cabecera muestra el término buscado y permite volver a editarlo; los resultados se presentan como una lista vertical compacta.
- Cada resultado muestra la abreviatura oficial de cada plataforma disponible, en turquesa y mayúsculas, sin bordes ni estado de selección, y conserva el nombre completo de cada plataforma de forma accesible.
- Los resultados distinguen el videojuego y las plataformas que ya pertenecen a la biblioteca; solo las plataformas todavía ausentes pueden abrirse para configurar el alta.
- Los resultados identifican de forma compacta la presencia en la biblioteca con un doble check y la propiedad con una bolsa de compra adicional, manteniendo ambos conceptos separados y accesibles por texto alternativo.
- Entre el buscador y los resúmenes aparecen accesos visuales centrados para Videojuegos y Cómics, con fondo turquesa, símbolos blancos y nombres accesibles sin texto visible; Videojuegos abre su biblioteca y Cómics permanece deshabilitado.
- Los accesos y demás acciones de la portada utilizan Remix Icon para compartir el mismo lenguaje visual que el resto de la aplicación.
- Inicio muestra resúmenes independientes de Videojuegos y Cómics.
- Videojuegos carga hasta las tres entradas más recientes de la biblioteca real y trata los estados de carga, vacío y error.
- El resumen de Videojuegos prioriza portadas compactas sin repetir título ni plataforma; cada portada conserva el nombre accesible del juego.
- Cómics mantiene tres elementos de demostración hasta que exista su funcionalidad vertical.
- Cada resumen se identifica mediante un único título compacto, sin subtítulos redundantes.
- Cada resumen prepara una acción «Ver todos» representada por una flecha visible y con nombre accesible; la de Videojuegos abre `/biblioteca/videojuegos` y la de Cómics permanece deshabilitada.
- En móvil, los elementos se recorren horizontalmente con controles táctiles y sin depender de hover.
- La barra nativa permanece oculta para integrar el carrusel en el diseño sin impedir su desplazamiento.
- El desplazamiento horizontal queda contenido dentro de cada colección y no aumenta el ancho de la página ni de la cabecera.
- Desde 768 px, cada resumen se distribuye en una cuadrícula de tres columnas.
- Los datos de demostración de Cómics están aislados y no representan persistencia ni un contrato de dominio.
- La estructura permite añadir en el futuro películas, libros o música sin modificar el componente de presentación.

## Alcance

- Videojuegos está conectado al backend para búsqueda, alta y resumen de biblioteca.
- Incluye el acceso a la página completa de la biblioteca de videojuegos; las vistas de detalle y la persistencia de Cómics siguen fuera de alcance.

## Verificación

- La interfaz se comprueba desde 320 px y adapta su distribución a escritorio mediante `min-width`.
- Los títulos, estados remotos, resultados y controles todavía no disponibles se exponen de forma semántica.