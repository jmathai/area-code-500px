/**
 * This is a Joule which sends an SMS to a given phone number.
 * Author: Jaisen Mathai <jaisen@jmathai.com>
 */

/*
 * The joule-node-response module helps format responses properly.
 */
var Response = require('joule-node-response');
var Users = require('./users');
var Client = require('./client');
var Client500Px = require('600px');
var request = require('request');
var cheerio = require('cheerio');
var xmlResponse = '<?xml version="1.0" encoding="UTF-8"?> <Response> <Hangup/> </Response>';


exports.handler = function(event, context) {
  var jouleResponse = new Response()
      , client = new Client()
      , users = new Users()
      , component = event.path[0] || null
      , client500Px = new Client500Px({
        consumer_key: process.env.PX_KEY,
        consumer_secret: process.env.PX_SECRET,
        token: process.env.PX_USER_TOKEN,
        token_secret: process.env.PX_USER_SECRET
      });

  jouleResponse.setContext(context);
  jouleResponse.setContentType('application/json');
  
  if(component === 'lookup') {
    //curl -XGET "https://lookups.twilio.com/v1/PhoneNumbers/5108675309?CountryCode=US&Type=carrier" \
    // -u '{AccountSid}:{AuthToken}'
    request(
      'https://www.google.com/search?q=area+code+'+event.query['number']+'&aqs=chrome..69i64j0l5.7855j0j7&sourceid=chrome&ie=UTF-8'
      , {
          auth: {
            user: process.env.TWILIO_ACCOUNT_SID
            , pass: process.env.TWILIO_AUTH_TOKEN
          }
      }
      , function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var doc = cheerio.load(body)
              //, city = doc('h2');
              , city = doc('._Oqb')
              , cityName = city.text() || 'San Francisco'
              , imageUrl = 'https://drscdn.500px.org/photo/6361557/m%3D1600_k%3D1_a%3D1/7cd606b858a17da669e55d57c4b3304a'
              , imageTitle = 'Volker Handke'
              , imageLink = 'https://500px.com/photo/6361557/new-york-by-volker-handke'
              , photos;

          photos = client500Px.photos.searchByTerm(cityName, {image_size:'1600', rpp: '1', only: 'City and Architecture,Landscape'})
                    .catch(function() {
                      //jouleResponse.send({imageUrl: imageUrl, imageTitle: imageTitle, imageLink: imageLink});
                    })
                    .then(function(response) {
                      if(response && response['photos'].length > 0) {
                        imageUrl = response['photos'][0]['image_url'];
                        imageTitle = response['photos'][0]['description'] || response['photos'][0]['user']['fullname'];
                        imageLink = 'https://500px.com' + response['photos'][0]['url'];
                      }

                      jouleResponse.send({imageUrl: imageUrl, imageTitle: imageTitle, imageLink: imageLink});
                    });
        }
      }
    );
  }
};
