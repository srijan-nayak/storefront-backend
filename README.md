# Storefront backend

A nodejs backend for a hypothetical storefront.

## Installing and setting up

### Clone and install dependencies

```shell
git clone https://github.com/srijan-nayak/storefront-backend.git
cd storefront-backend

yarn
# or
npm i
```

### Set up PostgresSQL database using docker and docker-compose

First crete an external volume for the postgres database.

```shell
docker volume create storefront-postgres-data
```

Put required environment variables to set up the postgres database in a `.env` file. Things enclosed in `[]` can be
replaced with anything of your choice. Take a look at `sample.env` for how the `.env` file should look like.

```shell
echo PG_USER=[pg-user-name] > .env
echo PG_PASSWORD=[pg-password] >> .env
echo PG_DB=[db-name] >> .env
echo PG_PORT=[unused-port-on-host] >> .env
```

Finally, start the postgres database as a service with docker-compose. The postgres database will be exposed on the port
defined by the `PG_PORT` environment variable.

```shell
docker-compose up -d
```

Run the migrations to create all the required tables.

```shell
yarn db-migrate up
# or
npx db-migrate up
```

### Setup remaining environment variables

Put other required environment variables in the `.env` file. Again, take a look at `sample.env` for how the final .env
file should look like.

```shell
echo PG_HOST=localhost >> .env
echo PG_TEST_DB=[test-db-name] >> .env
echo PORT=[unused-port-on-host] >> .env
echo PEPPER=[random-string] >> .env
echo SALT_ROUNDS=[some-integer] >> .env
echo JWT_SECRET=[random-string] >> .env
```

### Run tests

If everything is set up properly, all tests should run successfully.

```shell
yarn test
# or
npm test
```

### Build and start the application

```shell
yarn start
# or
npm start
```

The server will be listening on the port defined by the `PORT` environment variable.
