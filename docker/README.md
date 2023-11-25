# Building binocular docker images

## Frontend
```bash
docker build --build-arg NODE_VERSION=$(cat .nvmrc | tr -cd '[:digit:].') -f docker/Dockerfile.frontend . -t binocular-frontend:latest
```

## Backend

```bash
docker build --build-arg NODE_VERSION=$(cat .nvmrc | tr -cd '[:digit:].') -f docker/Dockerfile.backend . -t binocular-backend:latest
```
