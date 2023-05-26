const Pool = require('pg').Pool
const pgp = require('pg-promise')();
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const connection = {
    user:  process.env.DATABASE_USER,
    host:  process.env.DB_HOST,
    database:  process.env.DATABASE_NAME,
    password:  process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
}

const pool = new Pool(connection)
 const db = pgp(connection);


module.exports = {
  pgp,
  db,
  pool
}


//module.exports = pool