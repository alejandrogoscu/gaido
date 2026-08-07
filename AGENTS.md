# Instrucciones del repositorio Gaido

## Alcance y comunicación

- Estas instrucciones se aplican a todo el repositorio.
- Un `AGENTS.md` más cercano puede añadir reglas para su subárbol y prevalece en caso de conflicto.
- Comunicarse con el usuario en español salvo que solicite otro idioma.
- Explicar decisiones y compromisos con lenguaje directo y proporcionado al cambio.

## Objetivo del producto

- Gaido es una biblioteca personal para administrar videojuegos.
- La aplicación es web actualmente y debe poder incorporar un cliente iOS/Android en el futuro.
- El backend propio con FastAPI es la única puerta de entrada a los datos.
- PostgreSQL es la base de datos; Supabase podrá alojarla posteriormente sin acoplar el dominio a su SDK.
- Desarrollar mediante funcionalidades verticales completas: datos, API, interfaz y tests en la misma iteración.
- Diseñar el frontend mobile first y adaptar progresivamente a pantallas mayores.

## Forma de trabajar

- Inspeccionar el código y el estado de Git antes de editar.
- Preservar cambios del usuario y evitar modificaciones ajenas a la tarea.
- Definir el comportamiento observable y los criterios de aceptación antes de implementar una funcionalidad.
- Hacer cambios pequeños, cohesionados y fáciles de revisar.
- Resolver de extremo a extremo la funcionalidad solicitada mientras quede trabajo seguro dentro de su alcance.
- No ampliar el producto por iniciativa propia ni introducir infraestructura futura sin una necesidad actual.
- No crear commits, hacer `push` ni reescribir historial salvo petición explícita del usuario.

## Calidad y diseño

- Aplicar Clean Code, SOLID y DRY con criterio, priorizando claridad y simplicidad.
- Evitar sobreingeniería, abstracciones prematuras y patrones aplicados de forma ceremonial.
- Una duplicación pequeña y clara es preferible a una abstracción sin casos de uso suficientes.
- Crear una abstracción cuando exista una responsabilidad estable o más de un uso real, no por previsión.
- Usar nombres orientados al dominio, funciones cohesionadas, tipos explícitos y flujos fáciles de seguir.
- Mantener la lógica de negocio independiente del transporte o la presentación cuando haya lógica que separar.
- No añadir código muerto, marcadores de posición innecesarios ni compatibilidad no requerida.
- Tratar los errores de forma explícita y devolver mensajes útiles sin filtrar detalles internos.
- Evitar comentarios que repitan el código; documentar el motivo cuando una decisión no sea evidente.

## Arquitectura general

- Mantener `apps/api` y `apps/web` como aplicaciones separadas dentro del mismo repositorio.
- Organizar el código por funcionalidad siempre que mejore la cohesión.
- Mantener en módulos compartidos únicamente infraestructura o conceptos realmente transversales.
- Utilizar rutas API versionadas bajo `/api/v1`.
- Considerar OpenAPI como contrato del backend y centralizar el acceso HTTP del frontend.
- No crear capas de servicio, repositorio, interfaces o DTO adicionales si solo delegan sin aportar reglas, aislamiento o testabilidad.

## Backend

- Usar FastAPI, Pydantic, SQLAlchemy y Alembic.
- Mantener las rutas HTTP delgadas: validación y traducción HTTP en la ruta; reglas de negocio fuera cuando existan.
- No exponer directamente modelos ORM como contrato público; utilizar esquemas de entrada y salida explícitos.
- Gestionar sesiones y transacciones de base de datos de forma acotada y predecible.
- Crear una migración Alembic para todo cambio persistente de esquema.
- Diseñar para PostgreSQL y no introducir soluciones incompatibles con una futura migración desde o hacia Supabase.
- Mantener validaciones coherentes entre dominio, base de datos y API.

## Frontend

- Usar React y TypeScript estricto.
- Evitar `any`; justificar localmente cualquier excepción inevitable.
- Organizar componentes, hooks, tipos y acceso a API alrededor de la funcionalidad que sirven.
- Usar TanStack Query para estado remoto cuando se incorpore; mantener el estado local cerca del componente que lo utiliza.
- No añadir Redux ni otro estado global sin una necesidad demostrable.
- Implementar estados de carga, vacío, error y éxito para cada interacción remota.
- Diseñar primero para anchos desde 320 px, en una sola columna y sin depender de `hover`.
- Usar controles táctiles cómodos, HTML semántico, etiquetas accesibles, foco visible y navegación por teclado.
- Añadir mejoras de escritorio mediante media queries con `min-width`, sin romper la experiencia móvil.
- Reutilizar variables y decisiones visuales; no introducir un framework de UI o CSS sin justificarlo.
- Mantener los componentes de presentación desacoplados de detalles innecesarios del transporte HTTP.

## Documentación del proyecto

- Inspeccionar `docs/` al comenzar una tarea y leer todos los documentos relacionados con la funcionalidad o área que se vaya a modificar.
- Consultar siempre `docs/domain.md` antes de modificar modelos, reglas de negocio, contratos API o comportamiento funcional.
- Tratar `docs/domain.md` como la fuente de verdad actual del dominio.
- Documentar cada funcionalidad vertical terminada en `docs/features/<nombre-de-la-funcionalidad>.md`, usando un nombre breve y descriptivo en kebab-case.
- Recoger en el documento de la funcionalidad su comportamiento observable, decisiones relevantes, alcance y verificaciones principales, sin duplicar innecesariamente el código ni la documentación del dominio.
- No modificar una regla funcional de forma implícita; señalar el cambio y confirmar decisiones ambiguas.
- Cuando cambie el dominio, actualizar en la misma funcionalidad la documentación, migraciones, API, interfaz y tests afectados.
- Mantener actualizados los documentos afectados como parte de la misma funcionalidad vertical.

## Docker y dependencias

- Ejecutar Python, Node.js, pnpm, uv, PostgreSQL, migraciones y tests dentro de contenedores.
- No instalar herramientas ni dependencias del proyecto directamente en macOS.
- Usar pnpm exclusivamente para JavaScript/TypeScript; no ejecutar `npm` ni `npx`.
- Usar uv y `pyproject.toml` para Python.
- Elegir versiones estables y compatibles; no usar betas, RC, canary, nightly ni etiquetas `latest`.
- Fijar dependencias directas y mantener actualizados `pnpm-lock.yaml` y `uv.lock`.
- Añadir una dependencia solo cuando resuelva una necesidad concreta y explicar su coste si no es evidente.
- Resolver e instalar dependencias desde contenedores.
- No guardar secretos en Git. Documentar variables nuevas en `.env.example` con valores locales seguros.
- Mantener `.gitignore` y `.dockerignore` actualizados cuando aparezcan artefactos nuevos.

## Tests y verificación

- Probar comportamiento observable y reglas relevantes, no detalles internos de implementación.
- Añadir un test de regresión al corregir un defecto reproducible.
- Usar PostgreSQL aislado y efímero para tests de persistencia; no sustituirlo por SQLite.
- Evitar que los tests escriban en la base de datos de desarrollo.
- En backend, cubrir casos correctos, validación, conflictos y errores relevantes de persistencia.
- En frontend, cubrir las interacciones principales y los estados remoto, vacío y error.
- Añadir pruebas end-to-end solo para recorridos críticos que justifiquen su coste.
- Levantar los servicios antes de usar `docker compose exec`:
  - `docker compose up --build --detach --wait`
- Ejecutar desde Docker, según corresponda al cambio:
  - `docker compose config --quiet`
  - `docker compose exec api uv run ruff check .`
  - `docker compose exec api uv run pytest`
  - `docker compose exec api uv run alembic check`
  - `docker compose exec web pnpm typecheck`
  - `docker compose exec web pnpm build`
  - `docker compose exec web pnpm test` cuando exista ese script.
- No considerar terminada una tarea con fallos o advertencias nuevas sin explicar y resolver.

## Definición de terminado

- Los criterios de aceptación se cumplen de extremo a extremo.
- El esquema, la API y la interfaz permanecen coherentes.
- Las migraciones necesarias están incluidas y comprobadas.
- Los estados de error y los límites relevantes están tratados.
- La interfaz funciona en móvil y no introduce problemas básicos de accesibilidad.
- Los tests relevantes, lint, typecheck y build pasan dentro de Docker.
- La funcionalidad vertical está documentada en `docs/features/` y los demás documentos afectados están actualizados.
- La documentación y `.env.example` reflejan cualquier cambio operativo.
- No quedan secretos, artefactos generados ni cambios no relacionados preparados para commit.

## Git

- Revisar `git status` y el diff antes de preparar un commit.
- Mantener un cambio lógico por commit siempre que sea razonable.
- Usar mensajes breves en español, comenzando con un verbo en infinitivo.
- No mezclar reformateos masivos con cambios funcionales sin necesidad.
- No usar operaciones destructivas ni reescribir historial sin autorización explícita.

## Code Review Rules

- Priorizar errores de corrección, integridad de datos, seguridad y regresiones sobre preferencias estilísticas.
- Señalar cambios de esquema sin migración, contratos API ambiguos o validaciones inconsistentes.
- Señalar tests que usen SQLite, dependan de datos de desarrollo o no aíslen sus efectos.
- Señalar instalaciones en el host, uso de npm/npx, dependencias no justificadas o versiones inestables.
- Señalar interfaces que no sean mobile first, dependan de `hover` o carezcan de accesibilidad básica.
- Señalar abstracciones sin beneficio actual, duplicación peligrosa y responsabilidades mezcladas.
- Señalar secretos, credenciales reales, datos sensibles o artefactos generados incluidos en Git.
- Proponer siempre el cambio seguro más pequeño que resuelva el problema detectado.
