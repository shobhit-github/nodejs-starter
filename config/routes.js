


/*      Dependencies
 ---------------------------------------------*/

var express           = require('express')
  , router            = express.Router();

var mid               = require(CTRL_ROOT + 'middlewares');


/*  controller dependencies
..........................................*/
var AuthController              =   require(CTRL_ROOT + 'auth')
  , UserController              =   require(CTRL_ROOT + 'users');





/**
 |=====================================================================
 |    Routers for the retailer stock app...
 |=====================================================================
 */


/* Routes for Authentication Module
 |........................................ */
router.post('/signup', mid.languageSetter, AuthController.signUp);
router.post('/login', mid.languageSetter, AuthController.login);
router.post('/forgot_password', mid.languageSetter, AuthController.forgotPassword);
router.post('/reset_password', mid.languageSetter, AuthController.resetPassword);
router.get('/logout', AuthController.logout);
router.get('/check_auth', [ mid.ensureAuthenticated ], AuthController.checkAuth);

router.post('/facebook', mid.languageSetter, AuthController.facebook);
router.post('/google', mid.languageSetter, AuthController.google);
router.post('/linkedin', mid.languageSetter, AuthController.linkedin);


/* Routes for User Module
 |........................................ */
router.get('/users_count', [ mid.languageSetter, mid.ensureAuthenticated ], UserController.usersCount);
router.put('/update_profile', [ mid.languageSetter, mid.ensureAuthenticated ], UserController.updateProfile);
router.delete('/remove_profile/:ids', [ mid.languageSetter, mid.ensureAuthenticated ], UserController.deleteUser);
router.put('/modify_password', [ mid.languageSetter, mid.ensureAuthenticated ], UserController.changePassword);
router.all('/all_users', [ mid.languageSetter, mid.ensureAuthenticated ], UserController.getAllUsers);







router.post('/uploader' , UserController.uploader);























module.exports = router;
