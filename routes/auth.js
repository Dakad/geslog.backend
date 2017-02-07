'use strict';

/**
 * =============================
 *
 * Ctrler for the api oAuth for /oauth/*
 * All methods receive (req:Request,res:Response,next:Middleware)
 *
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		+ renderLoginPage()

 *
 * Events : /
 * =============================
 */


/**
 * Load modules dependencies.
 */
// Built-in

// npm
const _ = require('lodash');
const express = require('express');


// Custom -Mine
const InjectError = require('../modules/di-inject-error');
const Util = require('../modules/util');





/**
 * Variables
 *
 */
const router = express.Router();
// Injected
let _dependencies = {};






router.inject = function inject(options) {

    if (!options) {
        throw new InjectError('all dependencies', 'authRoute.inject()');
    }

    if (!options.dal) {
        throw new InjectError('dal', 'authRoute.inject()');
    }

    if (!options.ctrlers) {
        throw new InjectError('ctrlers', 'authRoute.inject()');
    }

    if (!_.has(options, 'ctrlers.api')) {
        throw new InjectError('ctrlers.api', 'authRoute.inject()');
    }

    if (!_.has(options, 'ctrlers.auth')) {
        throw new InjectError('ctrlers.auth', 'apiRoute.inject()');
    }

    // if(!_.has(options,'ctrlers.public') ) {
    //     throw new InjectError('ctrlers.public', 'authRoute.inject()');
    // }

    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies, options);
};


router.init = function init() {

    router.use(_dependencies.ctrlers.auth.retrieveClientInfo);

    // Post token.
    // route : POST ..../auth/token
    router.post('/token', _dependencies.ctrlers.auth.getApiToken);

    // Called during the /grant to log the user.
    // router.route('/grant/user')
    //     .post([
    //         _dependencies.ctrlers.public.loginPosted,
    //         _dependencies.ctrlers.auth.logMe,
    //         _dependencies.ctrlers.public.afterLogin,
    //         _dependencies.ctrlers.auth.dialogPage
    //     ]);

    // Grant acces to this client.
    // route : ..../auth/grant?client_id=***&state=****&redirect_uri=****
    // router.route('/grant')
    //     .get([
    //         _dependencies.ctrlers.public.getClient,
    //         _dependencies.ctrlers.auth.isLogged,
    //         _dependencies.ctrlers.auth.dialogPage
    //     ])
    //     .post([
    //         _dependencies.ctrlers.public.getClient,
    //         _dependencies.ctrlers.auth.isLogged,
    //         _dependencies.ctrlers.auth.grant
    //     ]);




    // catch 404 and forward to error handler
    // router.use(_dependencies.ctrlers.auth.errorHandler);


};


/**
 * Exports
 */

// Methods

module.exports = router;