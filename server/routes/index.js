// Creating routing to determine how app responds to a client request - part of MIDDLEWARE

const express = require('express');
const db = require ('../db');

const dbUsers = require ('../db/users');
const dbExpenses = require ('../db/expenses');
const dbPreferences = require ('../db/preferences');
const dbAnalytics = require ('../db/analytics');

const auth = require('../authentication/token-verification')
const bodyParser = require('body-parser');

const router = express.Router();

router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Standard get request of url myvault.technology/api/
router.get('/', (request, response) => {
  response.json({ info: 'API  for MyVault App.' });
});

router;
// Types of requests,routed thorugh the db folder

//userlist requests
router.get('/users', auth, dbUsers.getUsers); 
router.get('/users/details', auth, dbUsers.getUserDetails); 
router.post('/users', dbUsers.createUsers);
router.post('/login', dbUsers.performLogin);
router.put('/users/update', auth, dbUsers.updateUsers);
router.delete('/users', auth, dbUsers.deleteUsers);

//expenselist requests
router.get('/expenses/', auth, dbExpenses.getExpensesByUser); 
router.get('/expenses/w/', auth, dbExpenses.getExpensesByUserPerWeek); 
router.get('/expenses/m/', auth, dbExpenses.getExpensesByUserPerMonth); 
router.get('/expenses/y/', auth, dbExpenses.getExpensesByUserPerYear); 
router.post('/expenses', auth, dbExpenses.createExpense);
router.delete('/expenses/del/:expenseid', auth, dbExpenses.deleteExpense);
router.put('/expenses/edit/:expenseid', auth, dbExpenses.editExpense);

router.get('/expenses/periodic', auth, dbExpenses.getPeriodicExpensesByUser);
router.post('/expenses/periodic', auth, dbExpenses.createPeriodicExpense);
router.put('/expenses/periodic', auth, dbExpenses.periodicExpenseTrigger);
router.put('/expenses/periodic/edit/:periodicid', auth, dbExpenses.editPeriodicExpense);
router.delete('/expenses/periodic/del/:periodicid', auth, dbExpenses.deletePeriodicExpense);



//preferenceslist requests
router.get('/pref', auth, dbPreferences.getPreferencesByUser); 
router.put('/pref', auth, dbPreferences.updatePreferencesByUser); 

//analytics requests
router.get('/analytics/CategoryTotalsEUR/a/', auth, dbAnalytics.getExpensesByCategory); 
router.get('/analytics/CategoryTotalsEUR/w/', auth, dbAnalytics.getExpensesByCategoryPerWeek); 
router.get('/analytics/CategoryTotalsEUR/m/', auth, dbAnalytics.getExpensesByCategoryPerMonth); 
router.get('/analytics/CategoryTotalsEUR/y/', auth, dbAnalytics.getExpensesByCategoryPerYear); 

router.get('/analytics/CategoryTotalsUSD/a/', auth, dbAnalytics.getExpensesByCategoryUSD); 
router.get('/analytics/CategoryTotalsUSD/w/', auth, dbAnalytics.getExpensesByCategoryPerWeekUSD); 
router.get('/analytics/CategoryTotalsUSD/m/', auth, dbAnalytics.getExpensesByCategoryPerMonthUSD); 
router.get('/analytics/CategoryTotalsUSD/y/', auth, dbAnalytics.getExpensesByCategoryPerYearUSD); 

router.get('/analytics/CategoryTotalsGBP/a/', auth, dbAnalytics.getExpensesByCategoryGBP); 
router.get('/analytics/CategoryTotalsGBP/w/', auth, dbAnalytics.getExpensesByCategoryPerWeekGBP); 
router.get('/analytics/CategoryTotalsGBP/m/', auth, dbAnalytics.getExpensesByCategoryPerMonthGBP); 
router.get('/analytics/CategoryTotalsGBP/y/', auth, dbAnalytics.getExpensesByCategoryPerYearGBP); 

router.get('/analytics/MonthlyTotalsEUR', auth, dbAnalytics.getMonthlyExpenses); 
router.get('/analytics/MonthlyTotalsUSD', auth, dbAnalytics.getMonthlyExpensesUSD); 
router.get('/analytics/MonthlyTotalsGBP', auth, dbAnalytics.getMonthlyExpensesGBP); 

router.get('/analytics/CurrencyTotals', auth, dbAnalytics.getExpensesByCurrency); 




module.exports = router;