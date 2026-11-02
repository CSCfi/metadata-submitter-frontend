# syntax=docker/dockerfile:1.28.0@sha256:bb22d9815c728170f72750f4e5b0d672e06176142e1d602c7e66c050100b7e5b

ARG BASE_IMAGE=node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5
ARG NGINX_IMAGE=nginx:1.31.8-trixie@sha256:5ab5b0b01097420873a3f3330f44248e34a3c2a3e8d5ee30658aeae8cb7435da
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
RUN --mount=type=secret,id=auth_file \
    --mount=type=secret,id=npm_token \
    ARTIFACTORY_NPM_TOKEN="$(cat /run/secrets/npm_token)" \
    PNPM_CONFIG_NPMRC_AUTH_FILE="/run/secrets/auth_file" pnpm install --frozen-lockfile

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

# To fix vulnerabilities
RUN apt-get update && apt-get install --only-upgrade -yqq perl-base libc6 libc-bin

RUN chown -R nginx:nginx /var/cache/nginx/ \
&& chown -R nginx:nginx /var/log/nginx \
&& chown -R nginx:nginx /usr/share/nginx \
&& chown -R nginx:nginx /var/run/


# This is just reminding the port in use inside a container
EXPOSE 8043
USER  101
ENTRYPOINT ["nginx", "-g", "daemon off;"]
