'use strict';

/**
 * =============================
 *
 * Ctrler for render the views
 * All methods receive (req:Request,res:Response,next:Middleware)
 * Only respond with a page to render and some variables
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		+ renderHomePage()
 *		+ renderLoginPage()
 *		+ renderSignupPage()
 *		+ renderAboutPage()
 *		+ renderDocPage()
 *		+ renderExePage()
 *		+ renderAppUpsertPage()
 *		+ renderAppListPage()
 *		+ renderErrorPage()
 *		+ errorHandler()
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
const unless = require('express-unless');

// Custom - Mine
const InjectError = require('../modules/di-inject-error');

const jsonDocFormat = require("../static/cheatsheet-help");
const devTeam = require("../static/dev-team");



/**
 * Variables
 *
 */
 const renderCtrler = {};

// Injected
let _dependencies = {};




/**
 * Used for the D.I, receive all dependencies via opts
 * Will throw an InjectError if missing a required dependenccy
 * @parameter   {Object}    opts    Contains all dependencies needed by ths modules
 *
 */
renderCtrler.inject = function inject (opts) {

    if(!opts){
        throw new InjectError('all dependencies', 'renderCtrler.inject()');
    }


    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies,opts);

};


renderCtrler.homePage = function renderHomePage(req, res) {
    res.render('home', {
        title: 'PFE App'
    });
};

renderCtrler.loginPage = function renderLoginPage(req, res) {
    res.render('user/login', {
        title: 'Sign in to continue'
    });
};
renderCtrler.loginPage.unless = unless;

renderCtrler.signupPage = function renderSignupPage(req, res) {
    res.render('user/signup', {
        title: 'Register a new user'
    });
};
renderCtrler.signupPage.unless = unless;


renderCtrler.docPage = function renderDocPage(req, res) {
    res.render('doc', {
        title: 'API Documentation',
        format: jsonDocFormat,
        urlApi: req.protocol + '://' + req.get('host') + '/api/v1'
    });
};

renderCtrler.trainingPage = function renderExePage(req, res) {
    res.render('exe', {
        title: 'Little training before the project'
    });
};

renderCtrler.aboutPage = function renderAboutPage(req, res) {
    res.render('about', {
        title: 'About the dev team of this marvellous app',
        team: devTeam
    });
};

renderCtrler.appListPage = function renderAppListPage(req, res) {
    res.render('app/list', {
        title: 'List of your registred apps',
        apps: res.apps || [res.client]
    });
};

renderCtrler.appUpsertPage = function renderAppUpsertPage(req, res) {
    return res.render('app/upsert', {
        title: res.title,
        action: res.action,
        client: res.client
    });
}


renderCtrler.dialogPage = function renderDialogPage(req, res) {
    return res.render('dialog', {
        title: 'Grant access to ' + res.client.name,
        client: res.client,
        user: req.user
    });
}



renderCtrler.errorPage = function renderErrorPage(err, res) {
    // set locals, only providing error in development
    res.locals.err = err;
    res.locals.msg = err.message;
    res.locals.status = err.status;
    res.locals.title = err.title || 'Error';
    return res.status(err.status || 500).render('error');
};


/**
 * Exports
 */

module.exports = renderCtrler;

