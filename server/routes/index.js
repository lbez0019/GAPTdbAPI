// Creating routing to determine how app responds to a client request - part of MIDDLEWARE

const express = require('express');
const db = require ('../db');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

router.get('/users', db.getUsers);

module.exports = router;