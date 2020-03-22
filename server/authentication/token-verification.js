require('dotenv').config();  //module loading environment variables from .env file
const jwt = require("jsonwebtoken"); //authentication vy means of JSON Web Tokens will take place

const checkToken = (request, response, next) => {
  let token = request.get("authorization");
  if (token) {
    // Remove Bearer from string
    token = token.slice(7);
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
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
  else { //if not token is provided
    var message = `Access Denied! Unauthorised user.`;
    response.status(401);
    response.json({ message });
  }
}

module.exports = checkToken;