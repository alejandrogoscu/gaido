# Gaido

Biblioteca personal de videojuegos construida con React, FastAPI y PostgreSQL.

## Requisitos

- Docker con Docker Compose.
- Git.

Python, Node.js, pnpm, PostgreSQL y el resto de herramientas se ejecutan dentro
de contenedores.

## Desarrollo

1. Opcionalmente, copia `.env.example` a `.env` para personalizar los puertos o
   las credenciales locales.
   La búsqueda de videojuegos requiere registrar una aplicación confidencial en
   Twitch y completar `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET`; estos valores no
   deben añadirse al repositorio.
2. Construye y levanta el entorno:

   ```sh
   docker compose up --build
   ```

La web estará disponible en <http://localhost:5174>, la documentación de la API
en <http://localhost:8000/docs> y PostgreSQL escuchará en `localhost:5432`.

El puerto web `5174` evita entrar en conflicto con otro contenedor local que ya
utiliza el puerto habitual de Vite (`5173`). Puede cambiarse mediante `WEB_PORT`.

## Versiones base

| Tecnología | Versión |
| --- | --- |
| Node.js LTS | 24.18.0 |
| pnpm | 11.20.0 |
| React | 19.2.8 |
| TanStack Query | 5.101.4 |
| React Router | 7.18.2 |
| Vite | 8.2.0 |
| TypeScript | 7.0.2 |
| Python | 3.14.6 |
| uv | 0.12.0 |
| FastAPI | 0.138.2 |
| HTTPX | 0.28.1 |
| argon2-cffi | 25.1.0 |
| SQLAlchemy | 2.0.51 |
| Alembic | 1.18.5 |
| PostgreSQL | 18.4 |

## Comandos habituales

```sh
docker compose exec api uv run pytest
docker compose exec api uv run ruff check .
docker compose exec web pnpm typecheck
docker compose exec web pnpm build
docker compose exec web pnpm test
docker compose exec api uv run alembic upgrade head
```