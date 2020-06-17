require('dotenv').config();  //module loading environment variables from .env file
const bodyParser = require('body-parser');
const express = require('express')
const datejs = require('datejs');
const app = express();
const bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");
app.use(bodyParser.json())
global.atob = require("atob");


const client = require('../db');

Date.prototype.addDays = function (days) {
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
  var new_trans_date;

  client.query('SELECT periodicid, lasttransdate, transactioncurrency, transactiontitle, expensecost, expensetype, interval FROM periodicexpenselist WHERE userid = $1 AND lasttransdate <= (current_date) ORDER BY periodicid ASC', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
      return;
    }
    var success = '1';
    var output = results.rows;
    console.log(output);

    var i;

    for (i = 0; i < output.length; i++) {
      var trans_date = output[i].lasttransdate; //transaction date
      var new_trans_date = trans_date;
      var now = new Date(); //current date

      console.log(new_trans_date);

      var j = 0

      var intervalArray = output[i].interval.split(" ");

      
      if (intervalArray[1].includes("month")) {
        let years =  now.getFullYear() - trans_date.getFullYear();
        var no_of_expense = (years * 12) + (now.getMonth() - trans_date.getMonth()) ;
        var no_of_expenses = no_of_expense / parseInt(intervalArray[0]);
      }
      else if (intervalArray[1].includes("week")) {
        var no_of_expense = Math.floor((now - trans_date) / (1000 * 60 * 60 * 24 * 7)); //difference between now and transaction date in WEEKS
        var no_of_expenses = no_of_expense / parseInt(intervalArray[0]);
      }
      else if (intervalArray[1].includes("day")) {
        var no_of_expense = Math.floor((now - trans_date) / (1000 * 60 * 60 * 24)); //difference between now and transaction date in DAYS
        var no_of_expenses = no_of_expense / parseInt(intervalArray[0]);
        console.log(no_of_expenses);
      }
      else if (intervalArray[1].includes("year")) {
        var no_of_expense =  now.getFullYear() - trans_date.getFullYear();
        var no_of_expenses = no_of_expense / parseInt(intervalArray[0]);
      }

      for (j = 1; j <= no_of_expenses; j++) {

        if (intervalArray[1].includes("month")) {
          var x = intervalArray[0];
          new_trans_date = (Date.parse(trans_date).add(x * j).month());
          //console.log(new_trans_date);
        }
        else if (intervalArray[1].includes("week")) {
          var x = intervalArray[0];
          new_trans_date = (Date.parse(trans_date).add(x * j).week());
          //console.log(new_trans_date);
        }
        else if (intervalArray[1].includes("day")) {
          var x = intervalArray[0];
          new_trans_date = (Date.parse(trans_date).add(x * j).day());
          console.log(x);
        }
        else if (intervalArray[1].includes("year")) {
          var x = intervalArray[0];
          new_trans_date = (Date.parse(trans_date).add(x * j).year());
          //console.log(new_trans_date);
        }

        client.query("INSERT INTO expenselist (userid, \"transactionPlace\", \"expenseType\", \"expenseCost\", \"transactionCurrency\", \"transactionTitle\", \"transactionOnline\", \"transactionDate\") VALUES ($1, $2, $3, $4, $5, $6, $7, date($8) )", [userid, "Periodic", output[i].expensetype, output[i].expensecost, output[i].transactioncurrency, output[i].transactiontitle, 'false', new_trans_date], (err, results) => {
          if (err) {
            console.log(err);
            var message = `Error! Cannot get transactions.`;
            response.status(400);
            response.json({ message });
            return;
          }

        })
      }

      client.query('UPDATE periodicexpenselist SET lasttransdate=$1 WHERE periodicid=$2;', [new_trans_date, output[i].periodicid], (err, results) => {
        if (err) {
          console.log(err);
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

  client.query('SELECT * FROM expenselist WHERE userid = $1 and "transactionDate" <= (current_date) ORDER BY "transactionDate" DESC', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    var periodic = "no";
    output = results.rows;
    response.status(200).json({ periodic, success, output });
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
    var periodic = "no";
    output = results.rows;
    response.status(200).json({ periodic, success, output });
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
    var periodic = "no";
    output = results.rows;
    response.status(200).json({ periodic, success, output });
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
    var periodic = "no";
    output = results.rows;
    response.status(200).json({ periodic, success, output });
  })
}

// returning all periodic expense records from periodicexpenselist for 1 user
const getPeriodicExpensesByUser = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT periodicid, transactiontitle, transactioncurrency, CAST(lasttransdate as text), expensecost, expensetype, interval FROM periodicexpenselist WHERE userid = $1', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get periodic transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    var periodic = "yes";
    output = results.rows;
    response.status(200).json({ periodic, success, output });
  })
}

// updating records from expenselist 
const editPeriodicExpense = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  const periodicid = request.params.periodicid;
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request

  client.query('UPDATE periodicexpenselist SET transactiontitle = $1, transactioncurrency = $2, expensecost = $3, expensetype = $4, interval = $5, lasttransdate = $6 WHERE userid = $7 and periodicid = $8;', [obj.title, obj.currency, obj.amount, obj.category, obj.interval, obj.date, userid, periodicid], (err, results) => {
    if (err) {
      var message = `Error! Expense not edited successfully.`;
      console.log(err);
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    var output = `Expense edited.`;
    response.status(200);
    response.json({ success, output });
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

      client.query('INSERT INTO periodicexpenselist (userid, periodicid, transactiontitle, lasttransdate, transactioncurrency, expensecost, expensetype, interval) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING periodicid',
        [userid, expense_id, obj.title, obj.date, obj.currency, obj.amount, obj.category, obj.interval], (err, results) => {
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

// deleting records from periodicexpenselist 
const deletePeriodicExpense = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  const periodicid = request.params.periodicid;

  client.query('DELETE FROM periodicexpenselist WHERE (periodicid = $1 and userid = $2)',
    [periodicid, userid], (err, results) => {
      if (err) {
        var message = `Error! Periodic expense not deleted.`;
        response.status(400);
        response.json({ message });
      }
      var success = '1';
      var output = `Periodic expense deleted.`;
      response.status(200);
      response.json({ success, output });
    })
}


// deleting records from periodicexpenselist 
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


// updating records from expenselist 
const editExpense = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;
  const expenseid = request.params.expenseid;
  obj = request.body;  // variable obj is initialised as the JSON body of the POST request

  client.query('UPDATE expenselist SET "expenseType"= $1, "expenseCost"= $2, "transactionPlace"= $3, "transactionDate"= $4, "transactionCurrency"= $5, "transactionTitle"= $6, "transactionOnline"= $7 WHERE userid = $8 and expenseid = $9;', [obj.category, obj.amount, obj.cashCard, obj.date, obj.currency, obj.title, obj.onlineSwitch, userid, expenseid], (err, results) => {
    if (err) {
      var message = `Error! Expense not edited successfully.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    var output = `Expense edited.`;
    response.status(200);
    response.json({ success, output });
  })
}

module.exports = { getExpensesByUser, getExpensesByUserPerWeek, getExpensesByUserPerMonth, getExpensesByUserPerYear, createExpense, createPeriodicExpense, deleteExpense, periodicExpenseTrigger, editExpense, editPeriodicExpense, getPeriodicExpensesByUser, deletePeriodicExpense }