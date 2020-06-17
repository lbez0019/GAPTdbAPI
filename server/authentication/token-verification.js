require('dotenv').config();  //module loading environment variables from .env file
const jwt = require("jsonwebtoken"); //authentication by means of JSON Web Tokens will take place

const checkToken = (request, response, next) => {
  let token = request.get("authorization");
  if (token) {
    // Remove Bearer from string
    token = token.slice(7);  // Remove "Bearer " from string
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => { //callback function to verify if token is valid
      if (err) { //i.e. if token is not valid
        var message = `Access Denied! Unauthorised user.`;
        response.status(401);
        response.json({ message });
      }
      else { //if token is valid
        request.decoded = decoded;
        next();
      }
    });
  }
  else { //if no token is provided
    var message = `Access Denied!`;
    response.status(401);
    response.json({ message });
  }
}

module.exports = checkToken;