require('dotenv').config();  //module loading environment variables from .env file
const bodyParser = require('body-parser');
const express = require('express')
const app = express();
const bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");
app.use(bodyParser.json())
global.atob = require("atob");


const client = require('../db');

function tokenDecode(token) {  // decoding JWT token to obtain JSON data
  var t = token;
  var base64SplitToken = t.split('.')[1]; // splitting header, payload, and signature and storing payload in base64SplitToken
  var decodedToken = JSON.parse(atob(base64SplitToken)); //using atob method to decode base 64 string and parsing in JSON object
  return decodedToken;
}

// returning preferences for user
const getPreferencesByUser = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT * FROM preferenceslist WHERE userid = $1', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get preferences.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    

    if (results.rows.length > 0){
        output = results.rows;
        response.status(200).json({ success, output });
    }
    else{
        client.query('INSERT INTO preferenceslist(userid) VALUES ($1)', [userid], (err, results) => {
            output = results.rows;
            response.status(200).json({ success, output });
        })
    }
  })
}

// updating preferences
const updatePreferencesByUser = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request

  client.query('UPDATE preferenceslist SET dark= $1, colour= $2 WHERE userid=$3', [obj.dark, obj.colour, userid], (err, results) => {
      if (err) {
        var message = `Error while updating preference`;
        response.status(404).json({message});
      }
      var success = '1';
      var output = `Preferences updated!`;
      response.status(200).json({success, output});
      return success;
    })
}


module.exports = { getPreferencesByUser, updatePreferencesByUser }