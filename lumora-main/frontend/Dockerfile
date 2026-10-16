FROM node:24-alpine AS build
RUN npm install -g pnpm@11.9.0
WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile
ARG APP
RUN pnpm --filter @lumora/${APP} build && cp -r apps/${APP}/dist /site

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site /usr/share/nginx/html
EXPOSE 8080
