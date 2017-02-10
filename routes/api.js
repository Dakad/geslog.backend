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
const fileUpload = require('express-fileupload');


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

    router.use(_dependencies.ctrlers.api.checkIfToken);

    router.use(fileUpload());

    router.all(['', '/zen'], _dependencies.ctrlers.api.zen);

    // Connect an admin or student and send back a token for futher request
    router.post('/connect', _dependencies.ctrlers.api.connect);

    // Retrieve the alls logins for a specified student by his matricule
    router.get('/logins/:matricule', _dependencies.ctrlers.api.listLogins);

    // Create a new user
    router.post('/user', _dependencies.ctrlers.api.addUser);

    // All interactions for an user
    router.get('/users', _dependencies.ctrlers.api.listUsers)
          .post('/users', _dependencies.ctrlers.api.importUsers);

    // Assign a profil to a specific user
    router.post('/access', _dependencies.ctrlers.api.addProfiles);
    
    // All interraction for an Profil
    router.get('/profil(/:id)?', _dependencies.ctrlers.api.getProfil)
          .post('/profil', _dependencies.ctrlers.api.setProfil)
          .delete('/profil/:id', _dependencies.ctrlers.api.deleteProfil);

    // All interraction for an Application
    router.get('/app(/:id)?', _dependencies.ctrlers.api.getApp)
          .post('/app', _dependencies.ctrlers.api.setApp)
          .delete('/app/:id', _dependencies.ctrlers.api.deleteApp);

    // Retrieve the specified pplication by his id
    router.get('/script/:appId', _dependencies.ctrlers.api.getScript);



    // Use as error msg on last resort
    router.use(function(err, req, res, next) {
        console.error(err.stack); // Instead log this error
        res.status(500).send('Something went to shit ! Go check your console _');
    });
};




/**
 * Exports
 */

// Objects

module.exports = router;