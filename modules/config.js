'use strict';

/**
 * =============================
 *
 * Config - Load the config variable from .env
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods :
 *		- dbUrlParseur()
 *		+ load()
 *
 * Events : /
 *
 *
 * =============================
 */



/**
 * Load modules dependencies.
 */

// Built-in
const path = require('path');

// npm
const Promise = require("promise");
const dconf = require('dotenv');
const nconf = require('nconf');
const URL = require('url');
const uuidV4 = require('uuid/v4');

// Mine
const InjectError = require('./di-inject-error');
const envFile = path.join(__dirname,'..','.env');






const dbUrlParser = function dbUrlParser(cb) {
    // const DB_URL = URL.parse(process.env.DATABASE_URL);
    const DB_URL = URL.parse(nconf.get('DATABASE_URL'));
    const DB_AUTH = DB_URL.auth.split(':');

    nconf.overrides({
        'DB_CONFIG': {
            dialect : 'postgres', // Which kind of DB
            username : DB_AUTH[0], //env var: DATABASE_USER
            password : DB_AUTH[1], //env var: DATABASE_PASSWORD
            host: DB_URL.hostname, // Server hosting the postgres database
            port: DB_URL.port || 5432, //env var: DATABASE_PORT
            database: DB_URL.pathname.split('/')[1],
            pool : {
              max: 5, //set pool max size to 17
              min: 2, //set min pool size to 5
              idle: 10000 //close idle clients after 10 seconds
            }

        }
    });
}


/**
 * Exports
 */

// Methods
module.exports = {
    load: function load(logger) {
        if (!logger) {
            throw new InjectError('logger', 'Config.load()');
        }
        return new Promise(function(fulfill, reject) {
            try {
                logger.info('[Config] Load .env vars into process.env');
                dconf.load(); // LOAD my .env files into process.env
                nconf.env(); // LOAD All process into nconf
                dbUrlParser();
                nconf.defaults({ 'APP_PORT': 3030 });
                // If not env. var TOKENT_SECRET, define a new one.
                nconf.defaults({ 'TOKEN_SECRET': uuidV4() });
                return fulfill(); // Done, next task on the promise
            } catch (ex) {
                return reject(new Error('[DB] Error while loading all configs - ' + ex.message))
            }
        });
    }

};