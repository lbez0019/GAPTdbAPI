require('dotenv').config();  //module loading environment variables from .env file

const Client = require('pg').Client;

const client = new Client({
  // specifying connection parameters from env file
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

client.connect(); // Connecting to postgres client using the above credentials

// returning all records from userlist 
const getUsers = (request, response) => { //assigning anonymous function to constant
  client.query ('SELECT * FROM userlist', (err, results)  => {
  if(err){
    throw err;
  }
  response.status(200).json(results.rows);
  })
};

// adding new records to userlist 
const createUsers = (request, response) => {
  const { name, pass } = request.body

  client.query('INSERT INTO userlist (username, password) VALUES (? , ?)', [name, crypt(pass, gen_salt('bf', 8))], (err, results) => {
    // crypt() does the hashing and gen_salt() prepares algorithm parameters for it. Blowfish cryptography with work factor 8 is used for passwords.
    if (err) {
      throw err
    }
    response.status(201).send(`User added: ${results.rows}`)
  })
}         

module.exports = {getUsers, createUsers}; //exporting to make use of within the whole api
