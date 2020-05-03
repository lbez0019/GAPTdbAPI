require('dotenv').config();  //module loading environment variables from .env file
const bodyParser = require('body-parser');
const express = require('express')
const app = express();
const bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");
app.use(bodyParser.json())
global.atob = require("atob");


const client = require('../db');

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function tokenDecode(token) {  // decoding JWT token to obtain JSON data
  var t = token;
  var base64SplitToken = t.split('.')[1]; // splitting header, payload, and signature and storing payload in base64SplitToken
  var decodedToken = JSON.parse(atob(base64SplitToken)); //using atob method to decode base 64 string and parsing in JSON object
  return decodedToken;
}

// returning all expense records from expenselist for 1 user
const periodicExpenseTrigger = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  var new_trans_date ;

  client.query('SELECT periodicid, lasttransdate, transactioncurrency, transactiontitle, expensecost, expensetype, count FROM periodicexpenselist WHERE userid = $1 AND lasttransdate <= (current_date) ORDER BY periodicid ASC', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
      return;
    }
    var success = '1';
    var output = results.rows;

    var i;

    for (i=0; i<output.length; i++){
      var trans_date = output[i].lasttransdate; //transaction date
      var now = new Date(); //current date
      var diff = Math.floor((now - trans_date) / (1000 * 60 * 60 * 24)); //difference between now and transaction date in DAYS
      var no_of_expenses = Math.floor(diff / 30); //monthly expenses - we have to add one per month 
      new_trans_date = trans_date.addDays(30);

      console.log(trans_date);
      console.log("test:"+(trans_date.addDays(30)));
      console.log(no_of_expenses);

      var j = 0

      for (j=0; j<no_of_expenses; j++){
        new_trans_date = new_trans_date.addDays(j * 30);
        client.query('INSERT INTO expenselist (userid, "transactionPlace", "expenseType", "expenseCost", "transactionCurrency", "transactionTitle", "transactionOnline", "transactionDate") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ', [userid, "Periodic", output[i].expensetype, output[i].expensecost, output[i].transactioncurrency, output[i].transactiontitle, 'false', new_trans_date], (err, results) => {
          if (err) {
            var message = `Error! Cannot get transactions.`;
            response.status(400);
            response.json({ message });
            return;
          }
          
        })
      }

      client.query('UPDATE periodicexpenselist SET count= $1, lasttransdate=$2 WHERE periodicid=$3;', [output[i].count, new_trans_date, output[i].periodicid], (err, results) => {
        if (err) {
          var message = `Error! Cannot get transactions.`;
          response.status(400);
          response.json({ message });
          return;
        }
      })
    }  
    output = 'Periodic expenses - ok';
    response.status(200).json({ success, output });
  })
}

// returning all expense records from expenselist for 1 user
const getExpensesByUser = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT * FROM expenselist WHERE userid = $1 ORDER BY "transactionDate" DESC', [userid], (err, results) => {
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

  client.query('SELECT * FROM expenselist WHERE userid = $1 and "transactionDate" >= (current_date - 7) and "transactionDate" <= (current_date) ORDER BY "transactionDate" DESC', [userid], (err, results) => {
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

  client.query("SELECT * FROM expenselist WHERE userid = $1 and \"transactionDate\" >= date_trunc('month', current_date - interval '1 month') and \"transactionDate\" <= (current_date) ORDER BY \"transactionDate\" DESC", [userid], (err, results) => {
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

  client.query("SELECT * FROM expenselist WHERE userid = $1 and \"transactionDate\" >= date_trunc('year', current_date - interval '1 year') and \"transactionDate\" <= (current_date) ORDER BY \"transactionDate\" DESC", [userid], (err, results) => {
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

  client.query('INSERT INTO expenselist (userid, "transactionPlace", "expenseType", "expenseCost", "transactionCurrency", "transactionTitle", "transactionOnline") VALUES ($1, $2, $3, $4, $5, $6, $7) ',
    [userid, obj.cashCard, obj.category, obj.amount, obj.currency, obj.title, obj.onlineSwitch], (err, results) => {
      if (err) {
        var message = `Error while posting expense`;
        response.status(400).json({ message });
      }
      var success = '1';
      var output = `Expense added to database`;
      response.status(201).json({ success, output });
      return success;
    })
}

// adding new records to expenselist 
const createPeriodicExpense = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request

  client.query('INSERT INTO expenselist (userid, "transactionPlace", "expenseType", "expenseCost", "transactionCurrency", "transactionTitle", "transactionOnline", "transactionDate") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING expenseid',
    [userid, "Periodic", obj.category, obj.amount, obj.currency, obj.title, 'false', obj.date], (err, results) => {
      if (err) {
        console.log(err);
        var message = `Error while posting expense`;
        response.status(400).json({ message });
      }

      expense_id = results.rows[0].expenseid;

      client.query('INSERT INTO periodicexpenselist (userid, periodicid, transactiontitle, lasttransdate, transactioncurrency, expensecost, expensetype) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING periodicid',
        [userid, expense_id, obj.title, obj.date, obj.currency, obj.amount, obj.category], (err, results) => {
          if (err) {
            console.log(err);
            var message = `Error while posting expense`;
            response.status(400).json({ message });
            return;
          }
        })

      var success = '1';
      var output = `Expense added to database`;
      response.status(201).json({ success, output });
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
      response.json({ success, output });
    })
}

module.exports = { getExpensesByUser, getExpensesByUserPerWeek, getExpensesByUserPerMonth, getExpensesByUserPerYear, createExpense, createPeriodicExpense, deleteExpense, periodicExpenseTrigger }