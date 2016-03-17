/*
 * The nodejs library by Twilio for their API.
 * This Joule exports the account SID and TOKEN into the environment.
 *
 * Environment Variables:
 *  - TWILIO_ACCOUNT_SID, Your Twilio account sid.
 *  - TWILIO_AUTH_TOKEN, Your Twilio auth token.
 *  - from, This must be your Twilio phone number.
 *
 * DO NOT INCLUDE SECRETS INTO THIS REPOSITORY.
 */
var client = require('twilio')();
var xmlResponse = '<?xml version="1.0" encoding="UTF-8"?> <Response> <Hangup/> </Response>';

module.exports = function() {
  this.constructBody = function(user, body) {
    return '('+user['name']+') ' + body.trim();
  };

  this.send = function(to, body, response) {
    client.sendMessage({
      body: body,
      to: to,
      from: process.env.FROM
    }, function(err, message) {
      if(response === null) {
        console.log(err);
        console.log(message);
        return;
      }

      /*
       * This is the function which is called when the API call to send an SMS completes.
       * We initialize the Response module so we can return a success or failure response.
       */
      if(err) {
        response.setHttpStatusCode(400);
        response.send(xmlResponse);
        return;
      } else if(message && message.sid) {
        response.send(xmlResponse);
        return;
      }
      response.setHttpStatusCode(500);
      response.send(xmlResponse);
    });
  };

  this.sendToEveryoneExcept = function(users, except, body) {
    var surround = arguments[3] || null
        , newBody;
    
    if(except !== null && typeof(users[except]) !== 'undefined') {
      newBody = this.constructBody(users[except], body);
    } else {
      newBody = body;
    }

    if(surround !== null) {
      newBody = surround + ' ' + newBody + ' ' + surround;
    }

    for(var number in users) {
      if(number == except) {
        console.log('Skipping ' + number);
        continue;
      }

      this.send(number, newBody, null);
    }
  };
};
