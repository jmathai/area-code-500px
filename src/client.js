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
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var xmlResponse = '<?xml version="1.0" encoding="UTF-8"?> <Response> <Hangup/> </Response>';

module.exports = function() {
  this.send = function(to, body, response, data) {
    client.sendMessage({
      body: body,
      to: to,
      from: process.env.FROM
    }, function(err, message) {
      /*
       * This is the function which is called when the API call to send an SMS completes.
       * We initialize the Response module so we can return a success or failure response.
       */
      if(err) {
        console.log(err);
        response.setHttpStatusCode(400);
      }

      if(data === 'xml') {
        response.send(xmlResponse);
      } else {
        response.send(data);
      }
    });
  };
};
