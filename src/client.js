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
        response.send({error: err});
        return;
      } else if(message && message.sid) {
        response.send({messageSid: message.sid});
        return;
      }
      response.setHttpStatusCode(500);
      response.send({error: 'unknown'});
    });
  };
};
