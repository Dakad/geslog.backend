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

    // Question pour David.
    // Pour connecter l'admin, ce n'est pas plutôt un GET ? 
    router.post('/connect', _dependencies.ctrlers.api.connect);

    router.get('/logins/:matricule', _dependencies.ctrlers.api.listLogins);

    router.post('/user', _dependencies.ctrlers.api.addUser);

    router.post('/users', _dependencies.ctrlers.api.addStudents);

    router.post('/access', _dependencies.ctrlers.api.addProfiles);

    router.get('/profil', _dependencies.ctrlers.api.getProfil)
        .post('/profil', _dependencies.ctrlers.api.setProfil)
        .delete('/profil', _dependencies.ctrlers.api.deleteProfil);

    router.get('/app(/:id)?', _dependencies.ctrlers.api.getApp)
        .post('/app', _dependencies.ctrlers.api.setApp)
        .delete('/app', _dependencies.ctrlers.api.deleteApp);

    router.get('/users', _dependencies.ctrlers.api.listUsers);

    router.get('/script/:appId', _dependencies.ctrlers.api.getScript);

    // Use as error msg on last resort
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