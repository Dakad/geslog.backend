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

// Routes
const apiRoute = require('./routes/api');

// Ctrlers
const apiCtrler = require('./ctrlers/api');


// Used as DI Container
const _dependencies = {
    logger: Logger,
    routes: {
        'api': { 'url': '/api', src: apiRoute },
    },
    ctrlers: {
        'api': apiCtrler,
    },
    dal: DAL,
    daos: {},
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



apiRoute.inject(_dependencies);
Logger.info('[App] apiRoute injected');


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