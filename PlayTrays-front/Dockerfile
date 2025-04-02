# stage1 as builder
FROM node:20.12.2-alpine3.18 AS builder


COPY package*.json ./

RUN npm install
# Copy rest of the files
COPY . .
# Build the project
RUN npm run build


FROM nginx:alpine AS production-build
COPY nginx.conf /etc/nginx/nginx.conf
## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*
# Copy from the stage 1
COPY --from=builder /dist /usr/share/nginx/html/playtrays-front
EXPOSE 80
EXPOSE 443
ENTRYPOINT ["nginx", "-g", "daemon off;"]