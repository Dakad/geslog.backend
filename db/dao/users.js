'use strict';

/**
 * =============================
 *
 * DAO to handle CRUD  on User Model
 * All methods returns a Promise
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		- create (nUser)
 *
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

// npm
const _ = require('lodash');
const unless = require('express-unless');

// Custom - Mine
const InjectError = require('../../modules/di-inject-error');
const Util = require('../../modules/util');
const ApiError = require('../../modules/api-error');
// Injected
let DB;





// Injected
let _dependencies = {};




const UserDAO = {


    /**
     * Used for the D.I, receive all dependencies via opts
     * Will throw an InjectError if missing a required dependenccy
     * @parameter   {Object}    opts    Contains all dependencies needed by ths modules
     *
     */
    inject: function inject(opts) {

        if (!opts) {
            throw new InjectError('all dependencies', 'UserDAO.inject()');
        }

        if (!opts.dal) {
            throw new InjectError('dal', 'UserDAO.inject()');
        }


        // Clone the options into my own _dependencies
        _dependencies = _.assign(_dependencies, opts);
        DB = _dependencies.dal;
    },


    create: function create(nUser) {
        nUser = DB.Users.build({
            email: nUser.email,
            pwd: nUser.pwd
        });
        return DB.Users.findOrCreate({
            where: {
                id: nUser.get('email')
            },
            defaults: nUser.get({
                plain: true
            })
        }).spread(function(user, created) {
            if (!created)
                throw new ApiError(400, user.email + ' is already taken. Choose another one');
            return created;
        });
    },


    findByEmail: function findByEmail(email) {
        return DB.Users.findOne({
            attributes: ["id", "email", "name", "salt", "pwd", "isAdmin", "avatar"],
            where: {
                email: email
            }
        }).catch(errorHandler);
    },








};




function errorHandler(err) {

    console.log(err);
    debugger;

}






/**
 * Exports
 */

// Object

module.exports = UserDAO;
