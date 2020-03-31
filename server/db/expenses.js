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

// returning all expense records from expenselist for 1 user
const getExpensesByUser = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT * FROM expenselist WHERE userid = $1', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    output = results.rows;
    response.status(200).json({ success, output });
  })
}

// returning weekly expense records from expenselist for 1 user
const getExpensesByUserPerWeek = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT * FROM expenselist WHERE userid = $1 and "transactionDate" >= (current_date - 7) and "transactionDate" <= (current_date)', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    output = results.rows;
    response.status(200).json({ success, output });
  })
}

// returning monthly expense records from expenselist for 1 user
const getExpensesByUserPerMonth = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query("SELECT * FROM expenselist WHERE userid = $1 and \"transactionDate\" >= date_trunc('month', current_date - interval '1 month') and \"transactionDate\" <= (current_date)", [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    output = results.rows;
    response.status(200).json({ success, output });
  })
}

// returning yearly expense records from expenselist for 1 user
const getExpensesByUserPerYear = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query("SELECT * FROM expenselist WHERE userid = $1 and \"transactionDate\" >= date_trunc('year', current_date - interval '1 year') and \"transactionDate\" <= (current_date)", [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    output = results.rows;
    response.status(200).json({ success, output });
  })
}

// adding new records to expenselist 
const createExpense = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request

  client.query('INSERT INTO expenselist (userid, "transactionPlace", "expenseType", "expenseCost", "transactionCurrency", "transactionTitle", "transactionOnline") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [userid, obj.cashCard, obj.category, obj.amount, obj.currency, obj.title, obj.onlineSwitch], (err, results) => {
      if (err) {
        var message = `Error while posting expense`;
        response.status(400).json({message});
      }
      var success = '1';
      var output = `Expense added to database`;
      response.status(201).json({success, output});
      return success;
    })
}

// deleting records from expenselist 
const deleteExpense = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  const expenseid = request.params.expenseid;

  client.query('DELETE FROM expenselist WHERE (expenseid = $1 and userid = $2)',
    [expenseid, userid], (err, results) => {
      if (err) {
        var message = `Error! Expense not deleted.`;
        response.status(400);
        response.json({ message });
      }
      var success = '1';
      var output = `Expense deleted.`;
      response.status(200);
      response.json({ success,output });
    })
}

module.exports = { getExpensesByUser, getExpensesByUserPerWeek, getExpensesByUserPerMonth, getExpensesByUserPerYear, createExpense, deleteExpense }