# Stage 1: Builder
FROM node:20.12.2-alpine3.18 AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20.12.2-alpine3.18
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --production
EXPOSE 25565
CMD ["node", "build/server.js"]