'use strict';

/**
 * =============================
 *
 * Logger to log messages for the application.
 * This is a simple wrapper for the "winston" logger.
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		+ info(message)
 *		+ warn(message)
 *		+ error(message)
 *
 * Events : /

 *
 *
 * =============================
 */


/**
 * Load modules dependencies.
 */
 // npm
const winston = require('winston');
winston.emitErrs = true;


/**
 * Initialize logger
 */
const logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './bin/logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize:  1024000, //1MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});




/**
 * Exports
 */

// Methods
module.exports = logger;
module.exports.stream = {
    write: function(message){
        logger.info(message);
    }
};