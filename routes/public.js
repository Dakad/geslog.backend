'use strict';

/**
 * =============================
 *
 * Route for /*
 *
 * =============================
 *
 * Attributes :
 *
 * Routes   --> Ctrler :
 *      /   --> _dependencies.ctrlers.public.homePage
 *  home/   --> _dependencies.ctrlers.public.aboutPage
 *  about/  --> _dependencies.ctrlers.public.aboutPage
 *  doc/    --> _dependencies.ctrlers.public.docPage
 *  exe/    --> _dependencies.ctrlers.public.trainingPage
 *  login/  --> _dependencies.ctrlers.public.loginPage
 *  signup/ --> _dependencies.ctrlers.public.signupPage
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
const express = require('express');
const router = express.Router();
const cookieParser  = require('cookie-parser')



// Custom - Mine
const InjectError = require('../modules/di-inject-error');


/**
 * Variables
 *
 */
 var manageSubRoute = express.Router();

 //Injected
let _dependencies = {};









router.inject = function inject (options){

    if(!options){
        throw new InjectError('all dependencies', 'publicRoute.inject()');
    }

    if(!options.dal) {
        throw new InjectError('dal', 'publicRoute.inject()');
    }

    if(!options.ctrlers) {
        throw new InjectError('ctrlers', 'publicRoute.inject()');
    }

    if(!_.has(options,'ctrlers.auth') ) {
        throw new InjectError('ctrlers.auth', 'publicRoute.inject()');
    }

    if(!_.has(options,'ctrlers.public') ) {
        throw new InjectError('ctrlers.public', 'publicRoute.inject()');
    }

    if(!_.has(options,'ctrlers.render') ) {
        throw new InjectError('ctrlers.render', 'publicRoute.inject()');
    }

    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies,options);


}


router.init = function init (){
    router.use(cookieParser(nconf.get('APP_COOKIE_SECRET')));

    // First Middleware to handle an incoming request
    router.use((req, res, next) => {
        // Locals only available during the request lifetime
        // and served to the rendered page.
        res.locals.currentUrl = req.path;
        res.locals.input = req.body; // Get the inputted form
        res.locals.flashMsg = req.cookies.flashMsg; // Get saved flashMsg
        res.locals.isAuth = req.signedCookies.isAuth; // Check if auth
        res.clearCookie('flashMsg'); // Delete the saved msg;

        // To save flash msg into cookies for the next call.
        res.flash = function(type, msg) {
            let flashMsg = req.cookies.flashMsg;
            if (!flashMsg || !flashMsg[type]) {
                flashMsg = {};
                flashMsg[type] = [];
            }
            if (typeof msg === 'string') {
                msg = {'title': '','msg': msg };
            }
            flashMsg[type].push(msg);
            res.cookie('flashMsg', flashMsg, {  httpOnly: true });
            res.locals.flashMsg = flashMsg;
        }


        next();
    });





    /* GET home page. */
    router.get(['/', '/home'], _dependencies.ctrlers.render.homePage);


    /* GET-POST login page. */
    router.route('/login')
        .get(_dependencies.ctrlers.render.loginPage)
        .post([
            _dependencies.ctrlers.public.loginPosted,
            _dependencies.ctrlers.auth.logMe,
            _dependencies.ctrlers.public.afterLogin
        ]);



    /* GET-POST signup page. */
    router.route('/signup')
        .get(_dependencies.ctrlers.render.signupPage)
        .post([
            _dependencies.ctrlers.public.signPosted,
            _dependencies.ctrlers.auth.registerMe,
            _dependencies.ctrlers.public.afterSignin
        ]);

    /* GET about page. */
    router.get('/logout', _dependencies.ctrlers.public.logMeOut);



    /* GET about page. */
    router.get('/about', _dependencies.ctrlers.render.aboutPage);

    /* GET documentation page. */
    router.get(['/exe', '/training'], _dependencies.ctrlers.render.trainingPage);

    /* GET documentation page. */
    router.get(['/doc', '/documentation'], _dependencies.ctrlers.render.docPage);





    /* GET registred Apps page. */


    router.use('/manage',manageSubRoute);
    // Must be logged to see this page
    manageSubRoute.use(_dependencies.ctrlers.auth.isLogged);

    manageSubRoute.param('clientId',_dependencies.ctrlers.public.getClient);
    manageSubRoute.get(['/', '/apps'],
            _dependencies.ctrlers.public.listClients,
            _dependencies.ctrlers.render.appListPage
    );

    manageSubRoute.get('/apps/:clientId',
            _dependencies.ctrlers.public.getClient,
            _dependencies.ctrlers.render.appListPage
    );


    // POST new app - DELETE
    manageSubRoute.route('/app/(:clientId)?')
            .get([
                _dependencies.ctrlers.public.appHandler
            ]) // Get the page to add new app
            .post([
                _dependencies.ctrlers.public.upsertApp
            ]); // Adding or editing new app




    // Error handler - catch all remaining error
    // and forward to error handler or handle it.
    router.use(_dependencies.ctrlers.public.errorHandler);


    // Last middleware -- Error handler - What to do when a error occurs
    router.use(_dependencies.ctrlers.render.errorPage);



};


/**
 * Exports
 */

// Methods

module.exports = router;