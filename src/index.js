/**
 * This is a Joule which sends an SMS to a given phone number.
 * Author: Jaisen Mathai <jaisen@jmathai.com>
 */

/*
 * The joule-node-response module helps format responses properly.
 */
var Response = require('joule-node-response');

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

exports.handler = function(event, context) {
  var response = new Response();
  response.setContext(context);
  /*
   *  event.body, The message to be sent in the SMS.
   *  event.to, The phone number the message should be sent to.
   */
  client.messages.create({
    body: event.post['body'],
    to: event.post['to'],
    from: process.env.FROM
  }, function(err, message) {
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
