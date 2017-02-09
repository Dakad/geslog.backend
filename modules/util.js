'use strict';


/**
 * Load modules dependencies.
 */
// Built-in


// npm
const util = require("util");
const crypto = require('crypto');

const _ = require('lodash');
const Promise = require('bluebird');
const nconf = require("nconf");
const jwt = require('jsonwebtoken');
const shortId = require("shortid");
const ms = require("ms");

shortId.characters('0123456789a@bcdefghijklmnopqrstuvwxyz_ABCDEFGH!JKLMNOPQR$TUVWXYZ');



/**
 * Vars
 *
 */

const Util = module.exports;




Util.DEF_TOKEN_EXP = Util.DEF_COOKIE_AGE = ms((31 * 3) + 'd'); // Valid for 3 months



Util.validToken = function(token, secret) {
    secret = ((!secret) ? nconf.get('APP_TOKEN_SECRET') : secret);
    return new Promise(function(fulfill, reject) {
        jwt.verify(token, secret, function(err, decoded) {
            return (err) ? reject(err) : fulfill(decoded);
        });
    });
}


Util.generateToken = function(claims, secret) {
    secret = ((!secret) ? nconf.get('APP_TOKEN_SECRET') : secret);
    return new Promise(function(fulfill) {
        claims.exp = (!claims.exp) ? Util.DEF_TOKEN_EXP : claims.exp;
        return fulfill(jwt.sign(claims, secret));
    });
}



/**
 * Generate a salt(Random Hex characters).
 *
 */
Util.generateSalt = function() {
    return Promise.resolve(crypto.randomBytes(32).toString('hex'));
}


/**
 * Hash the password with a givem salt.
 *
 */
Util.hashPassword = function(pwd, salt, length) {
    length = (!length) ? 64 : length;
    return Promise.resolve(crypto.pbkdf2Sync(pwd, salt, 1000, length).toString('hex'))
}


/**
 * Check if the plain given password + salt === hashed password.
 *
 */
Util.validPassword = function(pwd, salt, hashPassword, length) {
    length = (!length) ? 64 : length;
    return new Promise(function(fulfill) {
        Util.hashPassword(pwd, salt, length).then(function(hash) {
            return fulfill(_.isEqual(hashPassword, hash));
        })
    });
}

Util.generateShortUUID = function() {
    return shortId.generate();
}