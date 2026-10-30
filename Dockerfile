# syntax=docker/dockerfile:1.7
# Dokploy: build de Angular y nginx sirviendo dist/ en el puerto 8080.
# Los videos no van en la imagen: se sirven desde el bucket R2 vibrance-prod-public.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build \
    && find dist -type f -regex '.*\.\(js\|css\|html\|svg\|json\|txt\|xml\|webmanifest\)$' -size +1k -exec gzip -9 -k {} +

FROM nginxinc/nginx-unprivileged:1.29-alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/MelanieFruit/browser /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
