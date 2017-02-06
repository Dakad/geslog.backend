'use strict';

/**
 * =============================
 *
 * Route for /api/*
 *
 * =============================
 *
 * Attributes :
 *
 * Routes --> Ctrler :
 *      - /
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
const nconf = require('nconf');
const router    = require('express').Router();
const jwt = require('express-jwt');


// Custom - Mine
const InjectError = require('../modules/di-inject-error');
let _dependencies = {};



// Use authCtrl.checkAuth as middleware && put before all non-GET methods


router.inject = function inject (options){

    if(!options){
        throw new InjectError('all dependencies', 'apiRoute.inject()');
    }

    if(!options.dal) {
        throw new InjectError('dal', 'apiRoute.inject()');
    }

    if(!options.ctrlers) {
        throw new InjectError('ctrlers', 'apiRoute.inject()');
    }

    if(!_.has(options,'ctrlers.api') ) {
        throw new InjectError('ctrlers.api', 'apiRoute.inject()');
    }

    if(!_.has(options,'ctrlers.auth') ) {
        throw new InjectError('ctrlers.auth', 'apiRoute.inject()');
    }

    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies,options);
};




router.init = function init(){

    /* Default response to /api on every method {GET,POST, PUT, DELETE} */
    router.use('/', function(req, res, next) {
      res.json('Where are you going ? Nothing there :-( .');
    });


    router.all('/zen',_dependencies.ctrlers.api.zen);




};




/**
 * Exports
 */

// Objects

module.exports = router;
