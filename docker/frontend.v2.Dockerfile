# check if NODE_VERSION same as in .nvmrc!
ARG NODE_VERSION=${NODE_VERSION:-22.21.1}
ARG BUILDPLATFORM=${BUILDPLATFORM:-amd64}

FROM --platform=${BUILDPLATFORM} node:${NODE_VERSION}-alpine AS install_fe
WORKDIR /app/binocular/frontend

RUN --mount=type=bind,src=./binocular-frontend-new/package-lock.json,target=./package-lock.json,readonly \
   --mount=type=bind,src=./binocular-frontend-new/package.json,target=./package.json,readonly \
    npm ci --ignore-scripts && \
    npm cache clean --force

FROM --platform=${BUILDPLATFORM} node:${NODE_VERSION}-slim AS builder
WORKDIR /app/binocular

# COPY --from=install_root --chown=node:node /app/binocular/node_modules ./node_modules
COPY --from=install_fe --chown=node:node /app/binocular/frontend/node_modules ./frontend/node_modules

WORKDIR /app/binocular/frontend

COPY ./binocular-frontend-new ./
COPY --chown=node:node ./utils /app/binocular/utils

# ARG CACHEBUST
RUN npm run build

########## final lean image #########
FROM nginxinc/nginx-unprivileged:alpine3.22 AS lean

# copying compiled code from dist to nginx folder for serving
COPY  --from=builder --chown=node:node /app/binocular/dist /usr/share/nginx/html

# copying nginx config from local to image
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# exposing internal port
EXPOSE 80
