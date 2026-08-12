# Diseño visual de Gaido

Este documento recoge las decisiones visuales compartidas de la aplicación.

## Identidad

- El logotipo visible utiliza únicamente una «G» geométrica de inspiración retro.
- El símbolo debe poder utilizarse de forma independiente como futuro icono de aplicación.
- El turquesa es el color de marca predominante sobre fondos oscuros.
- La cabecera principal usa un fondo turquesa con el símbolo invertido en blanco y el claim «Colecciona sin límites» alineado al extremo opuesto.
- El claim evita referencias exclusivas a videojuegos para que la identidad pueda abarcar otras colecciones en el futuro.

## Tipografía

- Usar Space Grotesk como tipografía principal de la interfaz.
- Servir la tipografía desde los archivos del proyecto para no depender de servicios externos en ejecución.
- Limitar los pesos a `500` para texto destacado y `700` para títulos, etiquetas y botones.
- Mantener el texto de párrafo en peso normal para conservar la legibilidad en tamaños pequeños.

## Sistema visual

- Usar de momento un fondo negro fijo y superficies oscuras para diferenciar áreas; los fondos claros quedarán para el futuro modo claro.
- Priorizar bordes, contraste y jerarquía tipográfica frente a sombras y efectos decorativos.
- Mantener esquinas rectas en paneles, controles, botones, etiquetas y tarjetas.
- Evitar degradados, píldoras y redondeados decorativos.
- Reservar colores ajenos al turquesa para comunicar estados semánticos, como los errores.
- Mantener foco visible, contraste legible y controles táctiles cómodos desde 320 px.
- En formularios de autenticación, usar placeholders visibles y nombres accesibles en lugar de etiquetas visuales para mantener una composición más limpia.
- Centralizar los colores semánticos en `styles/tokens.css` para permitir un futuro tema claro sin acoplar los componentes a colores concretos.
- Mantener en `styles/global.css` únicamente el reset y los estilos realmente globales.
- Ubicar los estilos específicos junto a su componente mediante CSS Modules para evitar dependencias y colisiones globales.
