FROM node:18-alpine AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM nginx:1.27.5-alpine AS run

COPY default.conf /etc/nginx/conf.d/default.conf
COPY 10-nginx-variables.conf.template /etc/nginx/templates/10-nginx-variables.conf.template
COPY --from=build /app/build/ /usr/share/nginx/html