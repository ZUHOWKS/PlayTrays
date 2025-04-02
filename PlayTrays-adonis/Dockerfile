# Base stage
FROM node:20.12.2-alpine3.18 AS base

# Install pnpm globally
RUN npm install -g pnpm

# Install VLC (and any dependencies it requires) on Alpine
RUN apk update

# All deps stage
FROM base AS deps
WORKDIR /e2q-back
ADD package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Production only deps stage
FROM base AS production-deps
WORKDIR /e2q-back
ADD package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Build stage
FROM base AS build
WORKDIR /e2q-back
RUN ls -l /e2q-back
COPY --from=deps /e2q-back/node_modules /e2q-back/node_modules
ADD . .
RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /e2q-back
COPY --from=production-deps /e2q-back/node_modules /e2q-back/node_modules
COPY --from=build /e2q-back/build /e2q-back
EXPOSE 8080
EXPOSE 25575
