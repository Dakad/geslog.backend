'use strict';

/**
 * =============================
 *
 * Main application.
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *
 * Events : /
 *
 * =============================
 */


/**
 * Load modules dependencies.
 */
// Built-in


// npm


// Mine
const Config = require('./modules/config.js');
const Server = require('./modules/server.js');
const Logger = require('./modules/logger.js');

// DAL db
const DAL = require("./db/dal");

// DAOs
const UsersDAO = require('./db/dao/users');
const AppsDAO = require('./db/dao/apps');

// Routes
const apiRoute = require('./routes/api');
const authRoute = require('./routes/auth');
const defRoute = require('./routes/public');

// Ctrlers
const apiCtrler = require('./ctrlers/api');
const authCtrler = require('./ctrlers/auth');
const publicCtrler = require('./ctrlers/public');
const renderCtrler = require('./ctrlers/render');


// Used as DI Container
const _dependencies = {
  logger: Logger,
  routes: {
    'index' : { 'url' : '/',      src : defRoute},
    'public': { 'url' : '/public',src : defRoute},
    'api' :   { 'url' : '/api',   src : apiRoute},
    'auth' :  { 'url' : '/auth',  src : authRoute}
  },
  ctrles: {
    'api' : apiCtrler,
    'auth': authCtrler,
    'public': publicCtrler,
    'render': renderCtrler
  },
  dal: DAL,
  daos: {
    'users' : UsersDAO,
    'apps'  : AppsDAO
  },
};



// Now, inject the dependencies in all components needed.
// Don't bother specify which dpd6 , the components needed
// will take what it needs from _dpd6 options in inject(options)

Logger.info('[App] Application started');
Logger.info('[App] D.I started');

DAL.inject(_dependencies);
Logger.info('[App] DAL injected');

// UsersDAO.inject(_dependencies);
Logger.info('[App] UsersDAO injected');

// AppsDAO.inject(_dependencies);
Logger.info('[App] AppsDAO injected');


apiCtrler.inject(_dependencies);
Logger.info('[App] apiCtrler injected');

authCtrler.inject(_dependencies);
Logger.info('[App] authCtrler injected');

publicCtrler.inject(_dependencies);
Logger.info('[App] publicCtrler injected');


apiRoute.inject(_dependencies);
Logger.info('[App] apiRoute injected');

authRoute.inject(_dependencies);
Logger.info('[App] authRoute injected');

defRoute.inject(_dependencies);
Logger.info('[App] defRoute injected');


Logger.info('[App] D.I completed');


// Begin the real init. of the app
Config.load(_dependencies.logger)
  .then(DAL.initConnection)
  .then(() => Server.configServer(_dependencies)) // Only need the logger
  .then(() => Server.configRoutes(_dependencies))
  .then(Server.start)
  .then(() => Logger.info('[App] Application ready !!!'))
  .catch(function(err) {
    Logger.error(err);
    Server.stop();
  });





// If ctrl+c
process.on('SIGINT', Server.stop);
process.on('SIGTERM', Server.stop);

// If Exception
// using uncaughtException is officially recognized as crude.
// So listening for uncaughtException is just a bad idea.
// process.on('uncaughtException', Server.stop);
