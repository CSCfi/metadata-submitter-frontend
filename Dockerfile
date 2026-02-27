ARG BASE_IMAGE=node:22-bookworm-slim
ARG NGINX_IMAGE=nginx:1.29.5-trixie
# 1.29.5-trixie contains fix to prevenr man-in-the-middle (MITM) vulnerability
# NGINX proxying to TLS-enabled HTTP (HTTP 1.x and HTTP/2), gRPC, and uWSGI backends

#=======================
FROM ${BASE_IMAGE} AS appbuilder
#=======================

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY index.html package.json pnpm-lock.yaml vite.config.ts ./

RUN pnpm install --frozen-lockfile

COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.ts ./

RUN chown -R node:node /usr/src/app

RUN pnpm build

#=======================
FROM ${NGINX_IMAGE}
#=======================

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=appbuilder /usr/src/app/build /home/app/

RUN chown -R nginx:nginx /var/cache/nginx/ \
&& chown -R nginx:nginx /var/log/nginx \
&& chown -R nginx:nginx /usr/share/nginx \
&& chown -R nginx:nginx /var/run/


# This is just reminding the port in use inside a container
EXPOSE 8043
USER  101
ENTRYPOINT ["nginx", "-g", "daemon off;"]
