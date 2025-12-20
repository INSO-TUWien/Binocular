### Backup
```
docker exec ee792d3bc0a7 sh -c '
  mkdir -p /tmp/arangodb-dump/binocular-binocular && \
  arangodump \
    --server.endpoint tcp://127.0.0.1:8529 \
    --server.username root \
    --server.password changeme \
    --server.database binocular-binocular \
    --output-directory /tmp/arangodb-dump/binocular-binocular \
    --overwrite true
'
```

### Copy backup
```
mkdir -p /Users/markus/inso/binocular-db-backups
docker cp ee792d3bc0a7:/tmp/arangodb-dump/binocular-binocular \
  /Users/markus/inso/binocular-db-backups/
```

### Start new db container
```
docker run -d \
  --name bino-arango-restore \
  -p 38529:8529 \
  -e ARANGO_ROOT_PASSWORD=changeme \
  arangodb:3.12.4
```

### Verify it is running
```
docker logs bino-arango-restore | tail -n 1
```

### Copy backup file into new container
```
docker cp \
  /Users/markus/inso/binocular-db-backups/binocular-binocular \
  bino-arango-restore:/tmp/arangodb-dump/
```

### Restore
```
docker exec bino-arango-restore sh -c '    
  arangorestore \                
    --server.endpoint tcp://127.0.0.1:8529 \
    --server.username root \                 
    --server.password changeme \
    --server.database binocular-binocular \
    --create-database true \
    --input-directory /tmp/arangodb-dump                    
'
```
