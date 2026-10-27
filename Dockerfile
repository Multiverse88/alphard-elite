FROM docker.io/oven/bun:1-alpine
RUN apk add --no-cache nginx && mkdir -p /run/nginx
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun --bun run build
COPY nginx.conf /etc/nginx/http.d/default.conf
EXPOSE 80
CMD ["sh", "-c", "bun cms-server.ts & exec nginx -g 'daemon off;'"]
