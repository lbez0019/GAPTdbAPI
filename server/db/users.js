require('dotenv').config();  //module loading environment variables from .env file
const bodyParser = require('body-parser');
const express = require('express')
const app = express();
const bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");
app.use(bodyParser.json())

const client = require('../db');

// returning all records from userlist 
const getUsers = (request, response) => { //assigning anonymous function to constant
  client.query('SELECT * FROM userlist', (err, results) => {
    if (err) {
      var message = `Error! Cannot get users.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    output = results.rows;
    response.set('Content-Type', 'application/json');
    response.status(200).json({ success,output });
  })
}

// returning specific record from userlist 
const getUserByEmail = (request, response) => {
  const email = request.params.email;
  client.query('SELECT * FROM userlist WHERE email = $1', [email], (err, results) => {
    if (err) {
      var message = `Error! Cannot get user.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    output = results.rows;
    response.set('Content-Type', 'application/json');
    response.status(200).json({ success,output });
  })
}

// deleting records from userlist 
const deleteUsers = (request, response) => {
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request

  client.query('DELETE FROM userlist WHERE username = $1',
    [obj.username], (err, results) => {
      if (err) {
        var message = `Error! Account not deleted.`;
        response.status(400);
        response.json({ message });
      }
      var success = '1';
      var output = `Account deleted.`;
      response.status(200);
      response.json({ success,output });
    })
}

// adding new records to userlist 
const createUsers = (request, response) => {
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request
  let hashedPass = bcrypt.hashSync(obj.password, 10);
  //Blowfish cryptography with work factor 10 is used for passwords. Slower than md5 but less prone for others to obtain hashing function.

  client.query('INSERT INTO userlist (name, surname, dob, password, email) VALUES ($1, $2, $3, $4, $5)',
    [obj.name, obj.surname, obj.dob, hashedPass, obj.email], (err, results) => {
      if (err) {
        var message = `Conflict! User already exists.`;
        response.status(409);
        response.json({ message });
      }
      var success = '1';
      var output = `User registered!`;
      response.status(201);
      response.json({ success,output });
    })
}

const getUserByEmailForLogin = (email, callBack) => {
  client.query('SELECT * FROM userlist WHERE email = $1', [email], (err, results) => {
    if (err) {
      callBack(err);
    }
    return callBack(null, results.rows[0]);
  }
  );
}

const performLogin = (request, response) => {
  obj = request.body; //JSON body of POST request assigned to obj

  getUserByEmailForLogin(obj.email, (err, results) => {

    if (err) {
      var message = `Error while logging in!`
      response.status(400);
      response.json({ message });
    }
    if (!results) { //account not found
      var message = `Invalid email/password. Retry login!`;
      response.status(422);
      response.json({ message });
    }

    const result = bcrypt.compareSync(obj.password, results.password);
    if (result) { //if email found and password inputted matches password in db
      results.password = undefined;

      const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
        expiresIn: "1h"
      });

      return response.json({
        token: jsontoken
      });
    }

    else { //invalid password
      var message = `Invalid email/password. Retry login!`;
      response.status(422);
      response.json({ message });
    }
  });
}



module.exports = { getUsers, getUserByEmail, createUsers, deleteUsers, performLogin };
