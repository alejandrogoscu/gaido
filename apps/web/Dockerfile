FROM node:24.18.0-bookworm-slim

RUN corepack enable \
    && corepack install --global pnpm@11.20.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]