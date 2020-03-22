require('dotenv').config();  //module loading environment variables from .env file
const bodyParser = require('body-parser');
const express = require ('express')
const app = express();
const bcrypt = require('bcrypt');

app.use(bodyParser.json())

// Connecting to postgres db
const Client = require('pg').Client;
const client = new Client({
  // specifying connection parameters from env file
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

const connection = client.connect(); // Connecting to postgres client using the above credentials



module.exports = client;


