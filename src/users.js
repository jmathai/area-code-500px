var JouleNodeDatabase = require('joule-node-database')
    , db = new JouleNodeDatabase();


module.exports = function() {
  var usersKey = 'users'
      , users;

  this.getUserStatus = function(number) {
    if(typeof(users[number]) === 'undefined') {
      return -1;
    } else if(typeof(users[number]['name']) === 'undefined') {
      return 0;
    }

    return 1;
  };

  this.getNames = function() {
    var except = arguments[1] || null,
        users = '';
    for(var number in users) {
      if(number == except) {
        continue;
      }

      users += ', ' + users[number];
    }

    if(users.length > 0) {
      users = users.substring(0, users.length-2);
    }

    return users;
  };

  this.init = function() {
    return db.get(usersKey);
  };

  this.initUsers = function(u) {
    users = u || {};
  };

  this.reset = function() {
    return db.set(usersKey, {});
  };

  this.setName = function(number, name) {
    if(typeof(users[number]) === 'undefined') {
      return;
    }

    users[number]['name'] = name;
    return db.set(usersKey, users);
  };

  this.start = function(number) {
    if(typeof(users) === 'undefined') {
      return;
    }

    users[number] = {};

    return db.set(usersKey, users);
  };
};
