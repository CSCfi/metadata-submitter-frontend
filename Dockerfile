ARG BASE_IMAGE=node:22-bookworm-slim
ARG NGINX_IMAGE=nginx:1.28.0-bookworm

#=======================
FROM ${BASE_IMAGE} AS appbuilder
#=======================

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY src/ ./src/
COPY public/ ./public/

COPY index.html package.json vite.config.ts ./

RUN chown -R node:node /usr/src/app

# USER node

RUN pnpm install && pnpm build

#=======================
FROM ${NGINX_IMAGE}
#=======================
RUN apt-get -y update && apt-get install nginx -y
COPY nginx-sd-submit.conf /etc/nginx/conf.d/

# RUN chown -R nginx:nginx /etc/nginx/ \
# && chown -R nginx:nginx /usr/share/nginx/html/ \
# && chown -R nginx:nginx /var/cache/nginx/ \
# && chown -R nginx:nginx /var/run/ \
# && chown -R nginx:nginx /var/log/nginx/

COPY --from=appbuilder /usr/src/app/build /home/app/

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]

