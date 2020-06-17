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

//Pie Chart for analysis by category methods
// returning expenses per category
const getExpensesByCategory = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionCurrency" = \'eur\' GROUP BY exp."expenseType", cat.color',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    console.log(pieData);
    response.status(200).json({ success, pieData});
  })
}

// returning expenses per category
const getExpensesByCategoryPerWeek = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionDate" >= (current_date - 7) and "transactionDate" <= (current_date) and "transactionCurrency" = \'eur\' GROUP BY exp."expenseType", cat.color ',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryPerMonth = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionDate" >= date_trunc(\'month\', current_date) and "transactionDate" <= (current_date) and "transactionCurrency" = \'eur\' GROUP BY exp."expenseType", cat.color ',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryPerYear = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1  and "transactionDate" >= date_trunc(\'year\', current_date) and "transactionDate" <= (current_date) and "transactionCurrency" = \'eur\' GROUP BY exp."expenseType", cat.color' ,
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryUSD = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionCurrency" = \'usd\' GROUP BY exp."expenseType", cat.color',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    console.log(pieData);
    response.status(200).json({ success, pieData});
  })
}

// returning expenses per category
const getExpensesByCategoryPerWeekUSD = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionDate" >= (current_date - 7) and "transactionDate" <= (current_date) and "transactionCurrency" = \'usd\' GROUP BY exp."expenseType", cat.color ',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryPerMonthUSD = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionDate" >= date_trunc(\'month\', current_date) and "transactionDate" <= (current_date) and "transactionCurrency" = \'usd\' GROUP BY exp."expenseType", cat.color ',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryPerYearUSD = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1  and "transactionDate" >= date_trunc(\'year\', current_date) and "transactionDate" <= (current_date) and "transactionCurrency" = \'usd\' GROUP BY exp."expenseType", cat.color' ,
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryGBP = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionCurrency" = \'gbp\' GROUP BY exp."expenseType", cat.color',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    console.log(pieData);
    response.status(200).json({ success, pieData});
  })
}

// returning expenses per category
const getExpensesByCategoryPerWeekGBP = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionDate" >= (current_date - 7) and "transactionDate" <= (current_date) and "transactionCurrency" = \'gbp\' GROUP BY exp."expenseType", cat.color ',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryPerMonthGBP = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1 and "transactionDate" >= date_trunc(\'month\', current_date) and "transactionDate" <= (current_date) and "transactionCurrency" = \'gbp\' GROUP BY exp."expenseType", cat.color ',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getExpensesByCategoryPerYearGBP = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT "expenseType" AS name, CAST(SUM("expenseCost") AS INT) AS population, cat.color, \'black\' AS "legendFontColor", 15 AS "legendFontSize" FROM expenselist AS exp INNER JOIN categorylist AS cat ON (exp."expenseType" = cat."category") WHERE userid = $1  and "transactionDate" >= date_trunc(\'year\', current_date) and "transactionDate" <= (current_date) and "transactionCurrency" = \'gbp\' GROUP BY exp."expenseType", cat.color' ,
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    pieData = results.rows;
    response.status(200).json({ success, pieData });
  })
}

// returning expenses per category
const getMonthlyExpenses = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT COALESCE(SUM(exp."expenseCost"),0) as data FROM generate_series (1,EXTRACT(MONTH FROM(CURRENT_DATE))::INT ,1) as tme(i) LEFT OUTER JOIN expenselist exp ON (tme.i = EXTRACT(MONTH FROM (exp."transactionDate"))) AND userid = $1 AND "transactionDate" >= date_trunc(\'year\', current_date) AND "transactionDate" <= (current_date) AND "transactionCurrency" = \'eur\' GROUP BY tme.i ORDER BY tme.i',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    datasets = results.rows;
    size = results.rows.length;
    console.log(datasets);
    response.status(200).json({ success, size, datasets});
  })
}

// returning expenses per category
const getMonthlyExpensesUSD = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT COALESCE(SUM(exp."expenseCost"),0) as data FROM generate_series (1,EXTRACT(MONTH FROM(CURRENT_DATE))::INT ,1) as tme(i) LEFT OUTER JOIN expenselist exp ON (tme.i = EXTRACT(MONTH FROM (exp."transactionDate"))) AND userid = $1 AND "transactionDate" >= date_trunc(\'year\', current_date) AND "transactionDate" <= (current_date) AND "transactionCurrency" = \'usd\' GROUP BY tme.i ORDER BY tme.i',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    datasets = results.rows;
    size = results.rows.length;
    console.log(datasets);
    response.status(200).json({ success, size, datasets});
  })
}

// returning expenses per category
const getMonthlyExpensesGBP = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT COALESCE(SUM(exp."expenseCost"),0) as data FROM generate_series (1,EXTRACT(MONTH FROM(CURRENT_DATE))::INT ,1) as tme(i) LEFT OUTER JOIN expenselist exp ON (tme.i = EXTRACT(MONTH FROM (exp."transactionDate"))) AND userid = $1 AND "transactionDate" >= date_trunc(\'year\', current_date) AND "transactionDate" <= (current_date) AND "transactionCurrency" = \'gbp\' GROUP BY tme.i ORDER BY tme.i',
   [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    datasets = results.rows;
    size = results.rows.length;
    console.log(datasets);
    response.status(200).json({ success, size, datasets});
  })
}

// returning expenses per category
const getExpensesByCurrency = (request, response) => {
  const token = request.get("authorization");
  const userid = tokenDecode(token).result.userid;

  client.query('SELECT cur.currencyid, COALESCE(SUM("expenseCost"),0) as data FROM currencylist cur LEFT OUTER JOIN expenselist exp ON (exp."transactionCurrency" = cur.currencyid) AND exp.userid = $1 GROUP BY cur.currencyid ORDER BY cur.currencyid', [userid], (err, results) => {
    if (err) {
      var message = `Error! Cannot get transactions.`;
      response.status(400);
      response.json({ message });
    }
    var success = '1';
    datasets = results.rows;
    response.status(200).json({ success, datasets});
  })
}

module.exports = { getExpensesByCategory, getExpensesByCategoryPerWeek, getExpensesByCategoryPerMonth, getExpensesByCategoryPerYear, getExpensesByCategoryUSD, getExpensesByCategoryPerWeekUSD, getExpensesByCategoryPerMonthUSD, getExpensesByCategoryPerYearUSD, getExpensesByCategoryGBP, getExpensesByCategoryPerWeekGBP, getExpensesByCategoryPerMonthGBP, getExpensesByCategoryPerYearGBP, getMonthlyExpenses, getMonthlyExpensesUSD,getMonthlyExpensesGBP, getExpensesByCurrency }