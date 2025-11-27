ARG BASE_IMAGE=node:22-bookworm-slim
ARG NGINX_IMAGE=nginx:1.28.0-bookworm

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

COPY nginx-sd-submit.conf /etc/nginx/conf.d/

COPY --from=appbuilder /usr/src/app/build /home/app/

EXPOSE 443

ENTRYPOINT ["nginx", "-g", "daemon off;"]
