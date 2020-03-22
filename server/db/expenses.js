require('dotenv').config();  //module loading environment variables from .env file
const bodyParser = require('body-parser');
const express = require('express')
const app = express();
const bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");
app.use(bodyParser.json())

const client = require('../db');

// returning all expense records from expenselist for 1 user
const getExpensesByUser = (request, response) => {
  const userid = request.params.userid;
  client.query("SELECT * FROM expenselist WHERE userid = $1", [userid], (err, results) => {
    if (err) {
      throw err
    }
    transactions = results.rows;
    response.set('Content-Type', 'application/json');
    var json = response.status(200).json({ transactions });
  })
}

// returning weekly expense records from expenselist for 1 user
const getExpensesByUserPerWeek = (request, response) => {
  const userid = request.params.userid;
  client.query("SELECT * FROM expenselist WHERE userid = $1 and transactionDate >= (current_date - 7) and transactionDate <= (current_date)", [userid], (err, results) => {
    if (err) {
      throw err
    }
    transactions = results.rows;
    response.set('Content-Type', 'application/json');
    var json = response.status(200).json({ transactions });
  })
}

// returning monthly expense records from expenselist for 1 user
const getExpensesByUserPerMonth = (request, response) => {
  const userid = request.params.userid;
  client.query("SELECT * FROM expenselist WHERE userid = $1 and transactionDate >= date_trunc('month', current_date - interval '1 month') and transactionDate <= (current_date)", [userid], (err, results) => {
    if (err) {
      throw err
    }
    transactions = results.rows;
    response.set('Content-Type', 'application/json');
    var json = response.status(200).json({ transactions });
  })
}

// returning yearly expense records from expenselist for 1 user
const getExpensesByUserPerYear = (request, response) => {
  const userid = request.params.userid;
  client.query("SELECT * FROM expenselist WHERE userid = $1 and transactionDate >= date_trunc('year', current_date - interval '1 year') and transactionDate <= (current_date)", [userid], (err, results) => {
    if (err) {
      throw err
    }
    transactions = results.rows;
    response.set('Content-Type', 'application/json');
    var json = response.status(200).json({ transactions });
  })
}

// adding new records to expenselist 
const createExpense = (request, response) => {
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request
  
  client.query ('INSERT INTO expenselist (userid, transactionPlace, expenseType, expenseCost, transactionCurrency) VALUES ($1, $2, $3, $4, $5)', 
  [obj.userid, obj.transactionPlace, obj.expenseType, obj.expenseCost, obj.transactionCurrency], (err, results) => {
    if(err) {
      response.status(400).send(`Error while posting expense`);
    }
    response.status(201).send(`Expense added to database`);
  })
}    

module.exports = {getExpensesByUser, getExpensesByUserPerWeek, getExpensesByUserPerMonth, getExpensesByUserPerYear, createExpense }