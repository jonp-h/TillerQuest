In the docker folder:

- Create an .env with the following:

```
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_PORT=...

PGADMIN_DEFAULT_EMAIL=...
PGADMIN_DEFAULT_PASSWORD=...
PGADMIN_PORT=...

POSTGRES_HOST=... # the default gateway for the docker postgres_container
```

- Then start a postegresql instance with docker:

`docker-compose up -d`
