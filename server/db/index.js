require('dotenv').config();

const Client = require('pg').Client;

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

client.connect();

const getUsers = (request, response) => {
  client.query ('SELECT * FROM userlist', (err, results)  => {
  if(err){
    throw err;
  }
  response.status(200).json(results.rows);
  })
};

module.exports = {getUsers};
