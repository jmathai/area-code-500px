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
  jouleResponse.setHeader('Access-Control-Allow-Origin', '*');


  users.init()
  .done(function(userList) {
    users.initUsers(userList);
  
    switch(component) {
      case 'lookup':
        jouleResponse.setContentType('application/json');
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

                          jouleResponse.send({cityName: cityName, imageUrl: imageUrl, imageTitle: imageTitle, imageLink: imageLink});
                        });
            }
          }
        );
        break;
      case 'register':
        jouleResponse.setContentType('application/json');
        var fromNumber = event.query['number'].replace(/[^0-9]/, '');

        if(fromNumber.length < 10 || fromNumber.length > 11) {
          jouleResponse.setHttpStatusCode(400);
          jouleResponse.send({error: 'Invalid number. Must contain at least 10 digits and no more than 11.'});
          return;
        } else if(fromNumber.length === 10) {
          fromNumber = '1' + fromNumber;
        }

        users.register(fromNumber)
        .done(function(usersList) {
          client.send(fromNumber, 'Hello. Please reply with your name so we can customize our resume for you.', jouleResponse, {status: 'registered', number: fromNumber});
        });
        break;
      case 'webhook':
        jouleResponse.setContentType('application/xml');
        var fromNumber = event.query['From'].replace('+','')
            , userStatus = users.getUserStatus(event.query['From']);
        
        if(!fromNumber) {
          jouleResponse.setHttpStatusCode(400);
          jouleResponse.send('<ihatexml>Invalid number</ihatexml');
        } else if(userStatus === -1) {
          client.send(fromNumber, 'Please visit ' + process.env.WEBSITE_URL + ' for instructions on how to view this resume.', jouleResponse, 'xml');
        } else if(userStatus === 0) {
          users.setName(fromNumber, event.query['Body'])
          .done(function(usersList) {
            client.send(fromNumber, 'Thanks ' + event.query['Body'] + '. We\'ve customized the resume for you.', jouleResponse, 'xml');
          });
        }
        break;
      case 'number':
        var number = event.query['number']
            , user = users.getUser(number);

        jouleResponse.setContentType('application/json');
        if(!user) {
          jouleResponse.setHttpStatusCode(404);
          jouleResponse.send({error: 'User not found'});
        } else {
          jouleResponse.send(user);
        }
    }
  });
};
