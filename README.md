# PFE App - Backend

Welcome on the backend of this app.

This end use Express for the server and Sequelize as ORM for PostgreSQL.


# Before started

You must set the config of the app. I used an `.env` file as config files. It's much secured than .json files
The variables set in the `.env` files will loaded in put inte process.env of Node.JS, accessible anywhere in the backend.


Example of `.env` file

```js
DATABASE_URL=postgres://db_user:db_password@db_server:db_port/db_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_SERVER=db_server
DATABASE_PORT=db_port
DATABASE_NAME=db_name
DATABASE_SCHEMA=db_schema
DIALECT=postgres
APP_PORT=your_app_server
TOKEN_SECRET=your_token_secret

```

## DB
The first config concerns the DB, for that , you must set :

`.env`
* `DATABASE_URL`= The URL containning all infos necessary to connect to the DB. If not set, collect others DATABASE_*** var in the `.env` file
* `DATABASE_USER`= The DB user to connect as
* `DATABASE_PASSWORD`= The User password, Make sure this file is not public, otherwise your DB is compromised
* `DATABASE_SEVER`: The URL to the DB server
* `DATABASE_PORT`: The DB server port, by default this var is set to `5432`
* `DATABASE_NAME`: The DB name, not the schema name
* `DATABASE_SCHEMA`: The DB schema to use

The DB ORM is Sequelize and his dialect is set to Postgre.
The pool size is to (min.) 2 - 5 (max.) with an idle time set to 10000 ms.

If the DB schema is not created, it'll be on the boot of the app.


## Server
The next config is about the server. For that, you must set :

`.env`
* `APP_PORT`= The port to listen for the server. By default, it's :`3030`
* `APP_TOKEN_SECRET`= It's  the secret used to sign the token. If not set, it's will randomly generated for the lifetime of the app.
* `DATABASE_PASSWORD`= The User password, Make sure this file is not public, otherwise your DB is compromised


## Starting

On `npm start`, the app use nodemon to restart if crashes




## Author

[Dakad](https://dakad.me)

## License

This project is licensed under the MIT license. See the [LICENSE](../LICENSE) file for more info.