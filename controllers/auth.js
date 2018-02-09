/*      Dependencies
---------------------------------------------*/

var async = require('async')
    , env = require('node-env-file')('./.env')
    , request = require('request');

var User = require(MODEL_ROOT + 'users')
    , jade = require(HELP_ROOT + 'jade.compiler');


/**
 |======================================================================================
 |    Authentication Module start here...
 |======================================================================================
 */



var changeLoginStatus = function (user, status, callback) {

    User.loginStatus(user._id, status, function (err, update_status) {

        if (err)
            return callback(false);

        return callback(run_test())

    });
};


/*
 |--------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------
 */
exports.checkAuth = function (req, res) {

    return res.status(200).json({success: true, response: req.user});
};


/*
 |--------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------
 */
exports.signUp = function (req, res) {

    var profile = new User(req.body);

    profile.save(function (err, result) {

        if (err)
            return res.status(500).json({success: false, message: err});


        Notify.newUserRegistered(result, function (err) {

            if (err.error)
                return res.status(500).json({success: false, message: txt.INTERNAL_ERROR, description: err});

            return res.status(200).json({success: true, message: txt.REGISTERATION_DONE, token: createJWT(result)});
        });


    });

    /*User.findOne({ email: req.body.email }, function(err, existingUser) {

      var profile = new User(req.body);

      if (existingUser) {
        return res.status(409).json({ success: false, message: txt.ALREADY_EXIST });
      }

      profile.save(function(err, result) {
        if (err) {
          return res.status(500).json({ success:false, message: err.message });
        }

          return res.status(200).json({
            success: true,
            message: txt.REGISTERATION_DONE,
            token: createJWT(result)
          });
      });

    });*/
};


/*
 |--------------------------------------------------
 | Log in with Email
 |--------------------------------------------------
 */
exports.login = function (req, res) {

    User.findOne({username: req.body.username}, function (err, user) {
        if (!user) {
            return res.status(401).json({success: false, message: txt.NOT_EXIST});
        }

        user.comparePassword(req.body.password, function (err, isMatch) {

            if (!isMatch) {
                return res.status(401).json({success: false, message: txt.INCORRECT_PASSWORD});
            }


            changeLoginStatus(user, true, function (response) {

                if (!response)
                    return res.status(500).json({success: true, message: txt.INTERNAL_ERROR});

                return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: "JWT " + createJWT(user) });
            });

        });
    });
};

/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
exports.facebook = function (req, res) {

    var fields = '?fields=id,first_name,last_name,email,picture{url},gender';

    request.get({
        url: process.env.FB_TOKEN_URL, qs: { code: req.body.code, client_id: req.body.clientId, client_secret: FACEBOOK_SECRET, redirect_uri: req.body.redirectUri }, json: true
    }, function (err, response, accessToken) {

        if (response.statusCode !== 200) {
            return res.status(500).json({status: false, message: accessToken.error.message});
        }

        request.get({
            url: process.env.FB_GRF_API + fields,
            qs: accessToken,
            json: true
        }, function (err, response, profile) {

            var username = profile.first_name.toLowerCase() + profile.last_name.toLowerCase();
            var userData = { firstname: profile.first_name, lastname: profile.last_name, username: username, password: generateString(8), social: {facebook: profile.id}, picture: profile.picture.data.url, email: profile.email, gender: profile.gender === 'male' ? "M" : "F" };
            var user = new User(userData);

            if (response.statusCode !== 200) {
                return res.status(500).json({status: false, message: profile.error.message});
            }

            User.findOne({social: {facebook: profile.id}}, function (err, existingUser) {

                if (existingUser) {

                    changeLoginStatus(existingUser, true, function (response) {

                        if (!response)
                            return res.status(500).json({success: true, message: txt.INTERNAL_ERROR});

                        return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: createJWT(result) });
                    });

                } else {

                    user.save(function (err, result) {

                        if (err)
                            return res.status(400).json({success: false, message: txt.BAD_REQUEST, description: err});

                        changeLoginStatus(result, true, function (response) {

                            if (!response)
                                return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});

                            return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: createJWT(result) });
                        });

                    });
                }

            });
        });
    });
};


/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
exports.google = function (req, res) {

    request.post(process.env.GOOGLE_TOKEN_URL, {
        json: true, form:
            { code: req.body.code, client_id: req.body.clientId, client_secret: GOOGLE_SECRET, redirect_uri: req.body.redirectUri, grant_type: 'authorization_code' }

    }, function (err, response, token) {

        request.get({
            url: process.env.GOOGLE_API_URL,
            headers: {Authorization: 'Bearer ' + token.access_token},
            json: true
        }, function (err, response, profile) {

            if (profile.error) {
                return res.status(500).json({status: false, message: profile.error.message});
            }

            User.findOne({social: {google: profile.sub}}, function (err, existingUser) {

                var username = profile.given_name.toLowerCase() + profile.family_name.toLowerCase();
                var userData = { firstname: profile.given_name, lastname: profile.family_name, username: username, password: generateString(8), social: {google: profile.sub}, picture: profile.picture, email: profile.email, gender: profile.gender === 'male' ? "M" : "F" };
                var user = new User(userData);


                if (existingUser) {

                    changeLoginStatus(existingUser, true, function (response) {

                        if (!response)
                            return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});

                        return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: createJWT(existingUser) });
                    });

                } else {

                    user.save(function (err, result) {

                        if (err)
                            return res.status(400).json({success: false, message: txt.BAD_REQUEST, description: err});

                        changeLoginStatus(result, true, function (response) {

                            if (!response)
                                return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});

                            return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: createJWT(result) });
                        });

                    });
                }

            })
        });
    });
};


/*
 |--------------------------------------------------------------------------
 | Login with LinkedIn
 |--------------------------------------------------------------------------
 */
exports.linkedin = function (req, res) {

    var fields = '~:(id,first-name,last-name,email-address,picture-url,phone-numbers)';

    request.post(process.env.LKDN_TOKEN_URL, {
        json: true, form:
            { code: req.body.code, client_id: req.body.clientId, client_secret: LINKEDIN_SECRET, redirect_uri: req.body.redirectUri, grant_type: 'authorization_code' }

    }, function (err, response, token) {

        request.get({
            url: process.env.LKDN_PROFILE_URL + fields,
            qs: {oauth2_access_token: token.access_token, format: 'json'},
            json: true
        }, function (err, response, profile) {

            if (profile.error) {
                return res.status(500).json({status: false, message: profile.error.message});
            }

            User.findOne({social: {linkedin: profile.sub}}, function (err, existingUser) {

                var username = profile.firstName.toLowerCase() + profile.lastName.toLowerCase();
                var userData = { firstname: profile.firstName, lastname: profile.lastName, username: username, password: generateString(8), social: {linkedin: profile.id}, picture: profile.pictureUrl, email: profile.emailAddress, gender: profile.gender === 'male' ? "M" : "F" };
                var user = new User(userData);

                if (existingUser) {

                    changeLoginStatus(existingUser, true, function (response) {

                        if (err)
                            return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});

                        return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: createJWT(existingUser)});
                    });

                } else {

                    user.save(function (err, result) {

                        if (err)
                            return res.status(400).json({success: false, message: txt.BAD_REQUEST, description: err});

                        changeLoginStatus(result, true, function (response) {

                            if (!response)
                                return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});

                            return res.status(200).json({ success: true, message: txt.LOGIN_SUCCESS, token: createJWT(result) });
                        });

                    });
                }

            })
        });
    });
};


/*
 |--------------------------------------------------
 | Forgot password with email
 |--------------------------------------------------
 */
exports.forgotPassword = function (req, res) {

    var encryptedEmail = encrypt(req.body.email);

    User.findOne({email: req.body.email}, function (err, user) {

        if (!user || err) {
            return res.status(401).json({success: false, message: txt.NOT_EXIST});
        }

        user.reset_link = SERVER_URI + '#/set-password/' + encryptedEmail;

        jade.compile('reset_password', user, function (err, html) {
            if (err)
                return res.status(400).json({success: false, message: txt.BAD_REQUEST});

            sendMail({to: req.body.email, subject: 'Reset Password', html: html}, function (err, resp) {  // check email sending status
                if (err) {
                    return res.status(500).json({success: false, message: txt.EMAIL_FAILED, description: err});
                }
                return res.status(200).json({success: true, message: txt.EMAIL_SENT});
            });
        });

    }).select({password: 0, picture: 0, role: 0, status: 0, updated_at: 0});
};


/*
 |--------------------------------------------------
 | Forgot password with email
 |--------------------------------------------------
 */
exports.resetPassword = function (req, res) {

    var decryptedEmail = decrypt(req.body.email);

    async.waterfall([
        function (callback) {

            User.findOne({email: decryptedEmail}, function (err, user) {
                if (err)
                    return callback(err, false);
                if (!user)
                    return callback(401, false);

                callback(false, user);
            });

        },
        function (userData, callback) {

            userData.encryptPassword(req.body.password, function (err, hash) {
                if (err)
                    return callback(err, false);

                callback(false, {user: userData, hashed: hash});
            });
        },
        function (userDetail, callback) {
            User.update({_id: userDetail.user._id}, {$set: {password: userDetail.hashed}}, function (err, result) {
                if (err)
                    return callback(err, false);

                callback(false, {username: userDetail.user.username, password: req.body.password});
            });

        }
    ], function (err, result) {

        if (err) {
            if (err == 401)
                return res.status(401).json({status: false, message: txt.NOT_EXIST});
            return res.status(400).json({status: false, message: txt.BAD_REQUEST, decription: err});
        }

        return res.status(200).json({status: true, message: txt.PASSWORD_RESET, data: result});
    });


};


/*
 |--------------------------------------------------
 | Logout User
 |--------------------------------------------------
 */
exports.logout = function (req, res) {

    changeLoginStatus(JSON.parse(req.query.user), false, function (response) {

        if (!response)
            return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});

        res.status(200).json({success: true, message: txt.LOGOUT_SUCCESS});
    });

};







