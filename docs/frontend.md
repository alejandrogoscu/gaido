# Arquitectura del frontend

El frontend se organiza por responsabilidad y funcionalidad para permitir que Gaido incorpore distintos tipos de colección y varias vistas por cada uno sin concentrar el crecimiento en `App.tsx`.

## Responsabilidades

- `app/` compone los proveedores y declara el árbol de rutas. No contiene reglas ni presentación de una funcionalidad concreta.
- `layouts/` define los marcos público y autenticado. El layout público muestra el claim; el autenticado contiene la navegación de la aplicación.
- `features/` agrupa tipos, acceso a API, componentes, páginas y pruebas de cada área funcional.
- `shared/api/` contiene el comportamiento HTTP común, como cookies y traducción de errores, sin conocer dominios concretos.
- `shared/ui/` contiene componentes visuales con más de un uso real.
- `styles/` contiene únicamente tokens y estilos globales. Los estilos específicos viven junto a cada componente mediante CSS Modules.
- `@remixicon/react` proporciona los iconos de interfaz mediante imports individuales; no se copian SVG equivalentes dentro de cada funcionalidad.

## Rutas y acceso

- Las rutas públicas se agrupan bajo `PublicLayout` y se protegen para usuarios sin sesión.
- Las rutas privadas se agrupan bajo `AuthenticatedLayout` y requieren una sesión válida.
- Los guards resuelven carga, error, redirección y acceso; las páginas no repiten estas comprobaciones.
- TanStack Query mantiene la sesión remota y React Router decide la vista correspondiente.

## Crecimiento por áreas

Cada nuevo tipo de colección debe incorporarse como una funcionalidad independiente, por ejemplo `features/video-games/` o `features/comics/`, con sus páginas de biblioteca, recomendaciones y detalle cuando se implementen.

No se creará una abstracción común para colecciones hasta que existan al menos dos implementaciones con comportamiento compartido demostrado. Los elementos se moverán a `shared/` únicamente cuando sean realmente transversales.

La portada puede reutilizar una presentación común entre resúmenes porque Videojuegos y Cómics ya constituyen dos usos reales. Sus datos visuales de demostración permanecen aislados y serán sustituidos por cada fuente remota cuando exista el contrato correspondiente.

## Coherencia entre vistas

- Las páginas equivalentes usan `PageHeading` para presentar título y subtítulo en una posición estable.
- Los encabezados mantienen la misma jerarquía y ritmo vertical dentro de un layout, aunque cambie la longitud del contenido.
- Los contenidos equivalentes se anclan desde el inicio del layout y no se centran verticalmente según su altura, evitando desplazamientos entre rutas cortas y largas.
- Cada nueva área reutiliza este patrón antes de introducir una variante; una excepción debe responder a una diferencia real de experiencia, no solo al contenido mostrado.