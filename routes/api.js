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
const router = require('express').Router();
const jwt = require('express-jwt');


// Custom - Mine
const InjectError = require('../modules/di-inject-error');
let _dependencies = {};



// Use authCtrl.checkAuth as middleware && put before all non-GET methods


router.inject = function inject(options) {

    if (!options) {
        throw new InjectError('all dependencies', 'apiRoute.inject()');
    }

    if (!options.dal) {
        throw new InjectError('dal', 'apiRoute.inject()');
    }

    if (!options.ctrlers) {
        throw new InjectError('ctrlers', 'apiRoute.inject()');
    }

    if (!_.has(options, 'ctrlers.api')) {
        throw new InjectError('ctrlers.api', 'apiRoute.inject()');
    }


    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies, options);
};




router.init = function init() {

    /* Default response to /api on every method {GET,POST, PUT, DELETE} */


    router.all('/zen', _dependencies.ctrlers.api.zen);

    router.post('/connect', _dependencies.ctrlers.api.connect);

    router.post('/logins', _dependencies.ctrlers.api.listLogins);
    
    router.get('/profil(/:name)?',_dependencies.ctrlers.api.getProfil)
            .post('/profil',_dependencies.ctrlers.api.setProfil)
            .delete('/profil',_dependencies.ctrlers.api.deleteProfil);
            
    router.get('/app',_dependencies.ctrlers.api.getApp)
            .post('/app',_dependencies.ctrlers.api.setApp)
            .delete('/app',_dependencies.ctrlers.api.deleteApp);
            
    router.get('/users',_dependencies.ctrlers.api.listUsers);        

    router.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('Something went to shit ! Go check your console _');
    });
};




/**
 * Exports
 */

// Objects

module.exports = router;