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

## Usage with examples

### Users

#### Create endpoint

Creates user with provided details and returns created user with the password digest.

```http request
POST http://localhost:9876/users
Content-Type: application/json
Accept: application/json

{
  "id": "taysia_amylynn",
  "firstName": "Taysia",
  "lastName": "Amylynn",
  "password": "gramsblogger"
}
```

#### Authenticate endpoint

Returns a json web token (JWT) if valid credentials are provided.

```http request
POST http://localhost:9876/users/authenticate
Content-Type: application/json
Accept: application/json

{
  "id": "taysia_amylynn",
  "password": "gramsblogger"
}
```

#### Index endpoint

Returns a list of all users. Valid token is required.

```http request
GET http://localhost:9876/users
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImxvaWRhX21pbmEiLCJmaXJzdE5hbWUiOiJMb2lkYSIsImxhc3ROYW1lIjoiTWluYSIsInBhc3N3b3JkIjoiJDJiJDExJGpsWldWSVo3ckFFZmF6dVB2Z29aZE9vMDR3bmgxVDI0OW1EV2NnY0NOYjVsY0M0WjZRQmNHIiwiaWF0IjoxNjQyNTc0NjQ3fQ.YVfeFhF2UZVUXqP1YO8SPjAGdLAaX6xFZm5fDGljQWk
```

#### Show endpoint

Returns user details for the given user ID. Valid token is required.

```http request
GET http://localhost:9876/users/taysia_amylynn
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImxvaWRhX21pbmEiLCJmaXJzdE5hbWUiOiJMb2lkYSIsImxhc3ROYW1lIjoiTWluYSIsInBhc3N3b3JkIjoiJDJiJDExJGpsWldWSVo3ckFFZmF6dVB2Z29aZE9vMDR3bmgxVDI0OW1EV2NnY0NOYjVsY0M0WjZRQmNHIiwiaWF0IjoxNjQyNTc0NjQ3fQ.YVfeFhF2UZVUXqP1YO8SPjAGdLAaX6xFZm5fDGljQWk
```
