//Creating an ExpressJS app

const express = require ('express');
const apiRouter = require('./server/routes')

const app = express();

app.use (express.json()); // We will be using JSON bodies to POST/GET from our central database

app.use('/api', apiRouter); // Using router via /api path

app.listen(process.env.PORT || '3000' , () => { 
    //arrow function performing a callback (such that other code executes only after the following is executed)
    console.log('Server started! Running on port: ' + (process.env.PORT || '3000'));
    //logs to output console on what port is server listening

});  //Listening to Enivronment variable PORT if specified, Port 3000 if not specified



