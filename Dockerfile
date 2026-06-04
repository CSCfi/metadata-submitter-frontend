ARG BASE_IMAGE=node:22-bookworm-slim
ARG NGINX_IMAGE=nginx:1.29.5-trixie
# 1.29.5-trixie contains fix to prevenr man-in-the-middle (MITM) vulnerability
# NGINX proxying to TLS-enabled HTTP (HTTP 1.x and HTTP/2), gRPC, and uWSGI backends

#=======================
FROM ${BASE_IMAGE} AS appbuilder
#=======================

# Install pnpm for dependency installation
RUN npm install -g pnpm

# Setup the working directory
WORKDIR /usr/src/app

# Assume these change less often than the other files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Now copy the other files into place
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.ts ./

# Change ownership - this is probably not required.
# RUN chown -R node:node /usr/src/app

# Build
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
