# Diseño visual de Gaido

Este documento recoge las decisiones visuales compartidas de la aplicación.

## Identidad

- El logotipo visible utiliza únicamente una «G» geométrica de inspiración retro.
- El símbolo debe poder utilizarse de forma independiente como futuro icono de aplicación.
- El turquesa es el color de marca predominante sobre fondos oscuros.
- La cabecera principal usa un fondo turquesa con el símbolo invertido en blanco y el claim «Colecciona sin límites» alineado al extremo opuesto.
- En la cabecera autenticada, el acceso al menú usa tres líneas blancas sin borde exterior, conserva un área táctil de 48 px y al interactuar combina un fondo blanco translúcido con líneas turquesas.
- La navegación autenticada entra desde la derecha como un panel oscuro de altura completa, con fondo atenuado sobre el contenido y separadores gruesos con margen lateral entre identidad, navegación y sesión.
- Las vistas autenticadas inmersivas, como una biblioteca completa, entran desde la derecha y sustituyen temporalmente la cabecera global por una cabecera compacta con navegación de regreso y título.
- Los buscadores y filtros inmersivos reutilizan esa entrada lateral, una cabecera compacta y una acción principal fija al pie cuando necesitan confirmar una selección.
- El claim evita referencias exclusivas a videojuegos para que la identidad pueda abarcar otras colecciones en el futuro.

## Tipografía

- Usar Space Grotesk como tipografía principal de la interfaz.
- Servir la tipografía desde los archivos del proyecto para no depender de servicios externos en ejecución.
- Limitar los pesos a `500` para texto destacado y `700` para títulos, etiquetas y botones.
- Mantener el texto de párrafo en peso normal para conservar la legibilidad en tamaños pequeños.

## Sistema visual

- Usar Remix Icon como sistema común para los iconos de interfaz, priorizando sus variantes `Line` para conservar una apariencia geométrica y consistente.
- Mantener la «G» como símbolo propio de marca; no sustituirla por un icono genérico de la librería.
- Los iconos decorativos deben ocultarse a tecnologías de asistencia y los controles formados solo por un icono deben conservar un nombre accesible.
- Usar de momento el gris oscuro `#121918` como fondo común de toda la aplicación; los fondos claros quedarán para el futuro modo claro.
- Priorizar bordes, contraste y jerarquía tipográfica frente a sombras y efectos decorativos.
- Mantener esquinas rectas en paneles, controles, botones, etiquetas y tarjetas.
- Evitar degradados, píldoras y redondeados decorativos.
- Reservar colores ajenos al turquesa para comunicar estados semánticos, como los errores.
- Representar la fortaleza de contraseña con cinco segmentos rectos y una escala semántica centralizada en los tokens de color.
- Mantener foco visible, contraste legible y controles táctiles cómodos desde 320 px.
- Los diálogos modales contienen el foco durante la navegación por teclado y lo devuelven al control que los abrió al cerrarse.
- Los controles táctiles principales mantienen un área interactiva mínima de 44 por 44 px.
- En formularios de autenticación, usar placeholders visibles y nombres accesibles en lugar de etiquetas visuales para mantener una composición más limpia.
- Centralizar los colores semánticos en `styles/tokens.css` para permitir un futuro tema claro sin acoplar los componentes a colores concretos.
- Mantener en `styles/global.css` únicamente el reset y los estilos realmente globales.
- Ubicar los estilos específicos junto a su componente mediante CSS Modules para evitar dependencias y colisiones globales.
- Usar el patrón compartido `PageHeading` para que el título y el subtítulo ocupen posiciones estables al navegar entre vistas.
- Mantener en todas las vistas equivalentes la misma jerarquía, ancho y ritmo vertical del encabezado; el contenido puede cambiar sin provocar saltos en su posición.
- Anclar las vistas equivalentes a una distancia fija desde la cabecera; no centrarlas verticalmente en función de la altura variable de su contenido.
- En la portada autenticada, mostrar los resúmenes de colección como recorridos horizontales en móvil y cuadrículas de tres columnas desde 768 px.
- El acceso al buscador de la portada usa «Buscar títulos» para incluir tanto elementos guardados como contenido nuevo de cualquier futura colección; cada vista de resultados concreta mantiene el contexto del tipo de contenido que soporta actualmente.
- Usar portadas provisionales de color plano y monogramas mientras no existan imágenes reales, sin degradados ni efectos decorativos.
