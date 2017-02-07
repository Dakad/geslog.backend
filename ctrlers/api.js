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

apiCtrler.inject = function inject(opts) {

    if (!opts) {
        throw new InjectError('all dependencies', 'renderCtrler.inject()');
    }


    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies, opts);

};




const sendJsonResponse = function(res, resStatut, resData) {
    const resObj = {
        "data": resData,
        "err": {},
        "status": resStatut
    };
    res.status(resObj.status).json(resObj);
};


const sendJsonError = function(res, err) {
    const resObj = {
        "data": {},
        "err": err,
        "status": err.status
    };
    res.status(resObj.status).json(resObj);
};




apiCtrler.zen = function zen(req, res, next) {
    return sendJsonResponse(res, 200, 'Hello, I\' will soon give u some deep shit quotes ! Just wait for it !');
}

apiCtrler.login = function login(req, res, next) {
    // Check if user exists
    // If exists, generate Token

    return sendJsonResponse(res, 200, { "token": "user-todsfdfsdferqoijken", "type": "user-type" });
}


apiCtrler.listLogins = function listLogins(req, res, next) {
    console.log("LOOOOOOOGISN");
    // REcup matricule from body
    let matricule = req.body.matricule;
    if (!matricule) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : matricule'));
    }

    // Go find this user with this matricule
    _dependencies.dal.Users.find({
        where: { 'matricule': matricule }
    }, {
        include: [{
            model: _dependencies.dal.Applications,
            as: 'applications'
        }, {
            model: _dependencies.dal.Access,
            as: 'access'
        }]
    }).then(function(logins) {
        if (!logins) {
            logins = {};
        }
        return sendJsonResponse(res, 200, JSON.stringify(logins));
    })



};




/**
 * Exports
 */

// Methods
module.exports = apiCtrler;