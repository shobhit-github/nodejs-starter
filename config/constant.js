
/*      Dependencies
---------------------------*/
var ROOT = require('app-root-path').path;




/* App Settings
..................*/

global.NODE_ENV            =    process.env.NODE_ENV;

global.MONGO_CONNECT       =    (NODE_ENV === 'prod') ? process.env.MONGO_URI : process.env.MONGO_DEV_URL;

global.SERVER_URI          =    (NODE_ENV === 'prod') ? process.env.SERVER_URI : process.env.SERVER_DEV_URI;

global.IMG_URI             =    process.env.IMG_URI;

/* App Directory Paths
..................*/

global.IMG_ROOT            =    ROOT + process.env.IMG_DIR;

global.APP_ROOT            =    ROOT + process.env.APP_DIR;

global.FILE_ROOT           =    ROOT + process.env.FILE_DIR;

global.CONF_ROOT           =    ROOT + process.env.CONF_DIR;

global.HELP_ROOT           =    ROOT + process.env.HELP_DIR;

global.LIB_ROOT            =    ROOT + process.env.LIB_DIR;

global.LNG_ROOT            =    ROOT + process.env.LNG_DIR;

global.TEMPLATE_ROOT       =    ROOT + process.env.TEMPLATE_DIR;

global.CTRL_ROOT           =    ROOT + process.env.CTRL_DIR;

global.MODEL_ROOT          =    ROOT + process.env.MODEL_DIR;




/* App Secret Keys
..................*/

// Secret ids
global.TOKEN_SECRET        =    process.env.TOKEN_SECRET;

global.FACEBOOK_SECRET     =    process.env.FACEBOOK_SECRET;

global.FOURSQUARE_SECRET   =    process.env.FOURSQUARE_SECRET;

global.GOOGLE_SECRET       =    process.env.GOOGLE_SECRET;

global.GITHUB_SECRET       =    process.env.GITHUB_SECRET;

global.INSTAGRAM_SECRET    =    process.env.INSTAGRAM_SECRET;

global.LINKEDIN_SECRET     =    process.env.LINKEDIN_SECRET;

global.TWITCH_SECRET       =    process.env.TWITCH_SECRET;

global.WINDOWS_LIVE_SECRET =    process.env.WINDOWS_LIVE_SECRET;

global.YAHOO_SECRET        =    process.env.YAHOO_SECRET;

global.BITBUCKET_SECRET    =    process.env.BITBUCKET_SECRET;

global.SPOTIFY_SECRET      =    process.env.SPOTIFY_SECRET;

global.TWITTER_SECRET      =    process.env.TWITTER_SECRET;



/* SMTP Settings
..................*/

global.SMTP_HOST           =    process.env.SMTP_HOST;

global.SMTP_USER           =    process.env.SMTP_USER;

global.SMTP_PASS           =    process.env.SMTP_PASS;





