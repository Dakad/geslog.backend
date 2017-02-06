'use strict';

/**
 * =============================
 *
 * Ctrler for the route /api/*
 * All methods receive (req:Request,res:Response,next:Middleware)
 * Only respond with a statut and JSON Object
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		- sendJsonResponse(req:Req)
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

 // Custom -Mine
const Util = require('../modules/util');
const ApiError = require('../modules/api-error');
const DB = require('../db/dal');
const UserDAO = require('../db/dao/users');
const AppsDAO = require('../db/dao/apps');

// Custom - Mine
const InjectError = require('../modules/di-inject-error');
const apiCtrler = {};




// Injected
let _dependencies = {};




/**
 * Used for the D.I, receive all dependencies via opts
 * Will throw an InjectError if missing a required dependenccy
 * @parameter   {Object}    opts    Contains all dependencies needed by ths modules
 *
 */

apiCtrler.inject = function inject (opts) {

    if(!opts){
        throw new InjectError('all dependencies', 'renderCtrler.inject()');
    }


    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies,opts);

};



const sendJsonResponse = function (res,statut,data){
    res.status(statut).json(data);
};




apiCtrler.zen = function zen(req,res,next){
    return sendJsonResponse(res,200, 'Hello, I\' will soon give u some deep shit quotes ! Just wait for it !');
}






/**
 * Exports
 */

// Methods
module.exports = apiCtrler;