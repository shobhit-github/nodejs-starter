
/*      Dependencies 
---------------------------------------------*/

var express = require('express');

var crypto = require('crypto')
  , algorithm = 'aes-256-ctr'
  , cryptoKey = TOKEN_SECRET;
  
var nodeMailer  = require('nodemailer')
  , transporter = nodeMailer.createTransport('smtps://'+SMTP_USER+':'+SMTP_PASS+'@'+SMTP_HOST+'');

var jwt = require('jwt-simple')
  , moment = require('moment');


  


/**
 |======================================================================================
 |    Helper Methods that will user globally in this app
 |======================================================================================
 */


/*
 |--------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------
 */

global.createJWT = function (user) {

  var payload = { sub: user, iat: moment().unix(), exp: moment().add(14, 'days').unix() };
  return jwt.encode(payload, TOKEN_SECRET);
};




/*
 |--------------------------------------------------
 | Encryption && Decryption Algorithm
 |--------------------------------------------------
 */

global.encrypt = function(str) {   // Encryption

  var cipher = crypto.createCipher(algorithm, cryptoKey);
  var crypted = cipher.update(str,'utf8','hex');
  
  crypted += cipher.final('hex');
  
  return crypted;
};

global.decrypt = function(str) {   // Decryption
  
  var decipher = crypto.createDecipher(algorithm, cryptoKey);
  var dec = decipher.update(str,'hex','utf8');
  
  dec += decipher.final('utf8');
  
  return dec;
};



/*
 |--------------------------------------------------
 | String related functions
 |--------------------------------------------------
 */
global.generateString = function(len, charSet) {

  // random string generator
  var str, charSets = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSets.length);
    str += charSets.substring(randomPoz,randomPoz+1);
  }
  return str;
};



/*
 |--------------------------------------------------
 | Node Mailer 
 |--------------------------------------------------
 */

global.sendMail = function(mailOption, callback) {

  // send mail with defined transport object
  transporter.sendMail(mailOption, function(error, info){
    if(error){
      callback(error, null);
    }
    callback(null, info);
  });

};









/*
 |--------------------------------------------------
 | SMS Sender
 |--------------------------------------------------
 */
global.sendSMS = function (from, to, text) {

  client.sendMessage( { to:to, from:from, body:text }, function( err, data ) {

    if(err) console.error(err);
    else console.log(data);
  });
};














