'use strict';
/**
 * =============================
 *
 * Server , start/stop the server...
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods :
 *		- configServer():  Promise
 *		+ start()
 *		+ stop()
 *
 * Events :
 *    - onError([callback])
 *
 * =============================
 */


/**
 * Load modules dependencies.
 */

// Built-in
const path = require('path');


// npm
const _ = require('lodash');
const Promise = require('bluebird');
const nconf = require('nconf');
const express = require('express');
const Morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors')

// Custom - Mine
const InjectError = require('./di-inject-error');



/**
 * Variables
 */

// Server
const _app = express();
// To expose the methods on the server for outside
const Server = {};

let _dependencies = {};





/**
 * Return the port listened on the server.
 * If the server not defined yet, return the default port on env var.
 *
 */
function getBindedServerPort() {
    return (Server.instance && Server.instance.address()) ? Server.instance.address().port : nconf.get('APP_PORT');
}


/**
 * Events cb for error the Server
 */
function onError(err) {
    _dependencies.logger.error('[Server] ' + err);
};



/**
 * Configure server settings:
 *		- Set view engine json bodies
 *		- parse json bodies
 *
 */
Server.configServer = function configServer(options) {
    if (!options) {
        throw new InjectError('all dependencies', 'Server.configServer()');
    }

    if (!options.logger) {
        throw new InjectError('logger', 'Server.configServer()');
    }

    if (!options.dal) {
        throw new InjectError('dal', 'Server.configServer()');
    }

    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies, options);

    return new Promise(function(fulfill) {
        let folder = path.join(__dirname, '..', 'static');
        _dependencies.logger.info('[Server] Init the app(Express) with static folder :', folder);
        _app.use(express.static(folder));

        // Get port from env and store in Express.
        // logger.info('[Server] Init the app(Express) with env Port :',nconf.get('PORT'));
        // _app.set('port', nconf.get('PORT'));

        _dependencies.logger.info('[Server] Init the app(Express) with Logger :', 'WINSTON with morgan stream');
        _app.use(Morgan("short"));


        _dependencies.logger.info('[Server] Init the app(Express) with BOdyParser to :', 'JSON');
        _app.use(bodyParser.json()); // The body is parsed into JSON
        _app.use(bodyParser.urlencoded({
            extended: false
        })); // The JSON parsed body will only
        // contain key-value pairs, where the value can be a string or array
    
        _dependencies.logger.info('[Server] Init the app(Express) by enabling CORS :',' DONE');
        _app.use(cors());


        // _dependencies.logger.info('[Server] Init the app(Express) protection from some well-known web vulnerabilities :', 'helmet');
        _app.disable('x-powered-by')
        // _app.use(helmet());
        // _app.use(helmet.noCache());


        _dependencies.logger.info('[Server] Init done !');
        fulfill();
    });
};




/**
 *
 * Configure server route and error middlewares:
 *		- Set all possibles routes
 *		- Set the config middlewares to the route
 *		- Init the route
 */
Server.configRoutes = function configRoutes(options) {
    if (!options) {
        throw new InjectError('all dependencies', 'Server.configRoutes()');
    }
    if (!_.hasIn(options, 'logger')) {
        throw new InjectError('logger', 'Server.configRoutes()');
    }

    if (!_.hasIn(options, 'routes')) {
        throw new InjectError('routes', 'Server.configRoutes()');
    }

    if (!_.hasIn(options, 'ctrlers')) {
        throw new InjectError('ctrlers', 'Server.configRoutes()');
    }

    if (!_.hasIn(options, 'daos')) {
        throw new InjectError('daos', 'Server.configRoutes()');
    }

    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies, options);

    let logger = _dependencies.logger;
    let routes = _dependencies.routes;

    // const optionsToInject = _.assign({}, ctrlers, dal, daos);

    return new Promise(function(fulfill) {
        if (!_.has(_dependencies, 'ctrlers.api')) {
            throw new InjectError('apiCtrler', 'Server.configRoutes()');
        }

        logger.info('[Server - Routes] Init the app(Express) with route for : ', routes.api.url);
        _app.use(routes.api.url, routes.api.src);
        routes.api.src.init();


        logger.info('[Server - Routes] Init done !');

        fulfill();
    });

}


/**
 * Start the server:
 *		- Config server
 *		- Config Routes
 *		- Attach all necessary listener
 *		- Notify the callback
 *
 */
Server.start = function start(cb) {

    return new Promise(function(fulfill) {
        // Hold the instance of server
        Server.instance = _app.listen(nconf.get('APP_PORT'));

        Server.instance.on('listening', function() {
            _dependencies.logger.info('[Server] Web server listening on Port', getBindedServerPort());
        });

        Server.instance.on('close', Server.stop);
        Server.instance.on('error', function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    onError(new Error('Port :' + getBindedServerPort() + ' requires elevated privileges.\n', error));
                    break;
                case 'EADDRINUSE':
                    onError(new Error('Port :' + getBindedServerPort() + ' is already in use.\n', error));
                    break;
                default:
                    onError(error);
            }
        });

        fulfill();
    }).nodeify(cb); // Change this sh*t function into good Promise
};


/**
 * Stop the server:
 *		- Close the pool and the connection to PG
 *      - Stop the server
 */
Server.stop = function() {
    let logMsg;
    if (Server.instance && typeof Server.instance.close === 'function') {
        _dependencies.dal.stopConnection();
        Server.instance.close();
        logMsg = '[Server] Web server no more listening on Port';
        _dependencies.logger.warn(logMsg, getBindedServerPort());
        process.exit();
    } else {
        logMsg = '[Server] Cannot stop web server not yet still listening on :';
        _dependencies.logger.error(logMsg, getBindedServerPort());
    }
};





/**
 * Exports
 */

module.exports = Server;