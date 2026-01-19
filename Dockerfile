ARG BASE_IMAGE=node:22-bookworm-slim
ARG NGINX_IMAGE=nginx:1.29.1-bookworm

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

RUN mkdir /tmp/client_temp \
&& chown nginx:nginx /tmp/client_temp \
&& chmod 700 /tmp/client_temp \
&& chown -R nginx:nginx /usr/share/nginx/html/ \
&& chown -R nginx:nginx /var/cache/nginx/ \
&& chown -h -R nginx:nginx /var/run/ \
&& chown -R nginx:nginx /var/log/nginx/


# This is just reminding the port in use inside a container
EXPOSE 8043

ENTRYPOINT ["nginx", "-g", "daemon off;"]
