'use strict';

/**
 * =============================
 *
 * Ctrler for the route demanding some authentication
 * All methods receive (req:Request,res:Response,next:Middleware)
 *
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		+ isAuth()
 *		+ checkToken()
 *		+ logIn()
 *		+ signUp()

 *
 * Events : /
 * =============================
 */


/**
 * Load modules dependencies.
 */
// Built-in

// npm
const nconf = require('nconf');
const _ = require("lodash");
const unless = require('express-unless');


// Custom -Mine
const Util = require('../modules/util');
const InjectError = require('../modules/di-inject-error');
const ApiError = require('../modules/api-error');


/**
 * Variables
 *
 */
const authCtrler = {};
 // Injected
let _dependencies = {};
let DB;
let UsersDAO;
let AppsDAO;




authCtrler.inject = function inject (opts) {

    if(!opts){
        throw new InjectError('all dependencies', 'authCtrler.inject()');
    }

    if(!opts.dal) {
        throw new InjectError('dal', 'authCtrler.inject()');
    }

    if(!opts.daos) {
        throw new InjectError('daos', 'authCtrler.inject()');
    }

    if(!_.has(opts,'daos.users') ) {
        throw new InjectError('daos.api', 'authCtrler.inject()');
    }

    if(!_.has(opts,'daos.apps') ) {
        throw new InjectError('daos.auth', 'authCtrler.inject()');
    }
/*
    if(!_.has(opts,'daos.authApps') ) {
        throw new InjectError('daos.authApps', 'authCtrler.inject()');
    }

*/
    // Clone the options into my own _dependencies
    _dependencies = _.assign(_dependencies,opts);

    DB = _dependencies.dal;
    UsersDAO = _dependencies.daos.users;
    AppsDAO = _dependencies.daos.apps;

};


/*********************************
 * Public call
 *********************************/



/**
 * Check if this public requested made by user is auth before
 *
 */
authCtrler.isLogged = function isAuth (req, res, next) {
    const cookies = req.signedCookies;
    // If not, check if req.headers || req.body contains a token
    // Otherwise, throw ForbiddenError('You shall not pass ! Auth yourself first')
    if (!(cookies.isAuth && cookies.accessToken))
        return next(new ApiError.Unauthorized('You shall not pass ! Log in before to access this page !'));
    Util.validToken(cookies.accessToken)
        .then(function(decodedToken) {
            req.user = decodedToken;
            res.locals.isAuth = true;
            next();
        }).catch(function(err) {
            res.clearCookie('accessToken');
            res.clearCookie('isAuth');
            req.session = null; // Destroy session
            res.locals.isAuth = false;
            console.error(err);
        });

}
authCtrler.isLogged.unless = unless;


/**
 * Handle the login on the public
 *
 */
authCtrler.logMe = function logIn (req, res, next) {
    const user = req.body;
    // Validate the input from the user
    Util.validInput(user).then(function() {
        // Sanitize & clear the input
        req.sanitizeBody('email').normalizeEmail();
        // Go fecth the corresponding user in DB
        return UsersDAO.findByEmail(user.email);
    }).then(function(dbUser) {
        if (!dbUser)
            throw new ApiError(404, 'The user with ' + user.email + ' is not registred');
        return [dbUser, Util.validPassword(user.pwd, dbUser.get('salt'), dbUser.get('pwd'))];
    }).spread(function(dbUser,isValidPwd) {
        if (!isValidPwd)
            throw new ApiError(401, 'Unknown user');
        req.user = dbUser.toJSON();
        req.user.salt = req.user.pwd = undefined; // REmove the salt and pwd before return
        // Generate a token {id,expTime} signed with env['TOKEN_SECRET']
        return Util.generateToken({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            isAdmin: req.user.isAdmin
        });
    }).then(function(token) { // Call the next middleware
        req.user.token = token;
        next(null,true);
    }).catch(function(err) {
        if (!err instanceof ApiError)
            err = new ApiError(err);
        next(err);
    });
};


/**
 * Handle the signup on the public
 *
 */
authCtrler.registerMe = function signUp (req, res, next) {
    // Validate the input from the req.body
    Util.validInput(req.body).then(function() {
        // Sanitize & clear the input
        req.sanitizeBody();
        req.sanitizeBody('email').normalizeEmail();

        return req.body;
    }).then(UsersDAO.create) // Go Fetch a possible registred user with the same email.
    .then(function(created) {
        return next();
    }).catch(function(err) {
        next(err);
    });
};





/*********************************
 * Auth call from outside
 *********************************/


/**
 * Middleware to dig into the request headers or body
 * when the method is POST and url /token
 * to retrieve the infos sent by the client.
 *
 */
authCtrler.retrieveClientInfo = function digIntoHeadersOrBody (req,res,next)  {
    const retrieveFrom = (source) => {
        const infos = {};
        let info = source['clientId'];

        // Check if at least, the clientId && clientSecret are inside

        if(!info)
            return new ApiError.BadRequest('Missing the clientId for the authentication');
        infos['clientId'] = info.trim();

        if(!(info = source['clientSecret']))
            return new ApiError.BadRequest('Missing the clientSecret for the authentication');
        infos['clientSecret'] = info.trim();

        if(info = source['state']) infos['state'] = info.trim();

        if(info = source['redirectUri']) infos['redirectUri'] = info.trim();

        return infos;
    }

    res.locals.query =  '?'+Object.keys(req.query).reduce((p,q,i) => {
        return (q +'='+ req.query[q] + ((p) ? '&'+p :''));
    },'');

    if(req.method === 'POST') // If the client want something, set in the headers OR body ,not both
        req.from = (req.get('clientId')) ? retrieveFrom(req.headers) : retrieveFrom(req.body);

    if(req.from.type && req.from.type === 'ApiError')
        next(req.from);
    else
        next();
}


/**
 * Middleware to give an accessToken to a client.
 * Dig into the request headers or body and look for an
 *  -   (REQUIRED) client_id || clientId
 *  -   (REQUIRED) client_secret || clientSecret
 *  -   (Optionnal) state
 *  -   (Optionnal) redirect_uri
 * If present && auth, pass and check the lifetime of the token
 * Otherwise, don't talk to him, just shO0ot him with a APIError
 *
 */
authCtrler.getApiToken = function createApiToken (req,res) {
    // Go fetch the requested & registred client
    AppsDAO.checkIfRegistred(req.from)
    .then((client) =>{
        return [
            client,
            Util.validPassword(
                client.id, // The client Id
                req.from.clientSecret, // Equivalent to pwd
                client.accessToken, // The real hash in DB of those two {id+secret}
                client.id.length)
        ];
    }).spread((client,isValid) => {
        if(!isValid)
            throw new ApiError.Unauthorized('This client is not registred. Unknown id or secret!');
        client.accessToken = client.secret = undefined;
        client = client.toJSON();
        client.state = req.from.state;
        if (client.useRedirectUri === false && req.from.redirectUri)
            client.redirectUri = req.from.redirectUri;
        res.client = client;
        return Util.generateToken({
            id: client.id,
            name: client.name,
            scope : client.scope
        });
    }).then((token) => {
        let url = res.client.redirectUri+token;
        url += '&clientId='+res.client.id;
        url += (res.client.state) ? '&state='+res.client.state : '';
        res.redirect(url); // Send back the token
    }).catch((err) => {
        // @TODO REplace by a fct which do that
        res.status(err.status || 500).json(err.message || 'Some error occured, better formatin coming  !');

        debugger;
    });
}


/**
 * Middleware to check if the request is auth.
 * Dig into the request headers or body and look for an
 *  -   (REQUIRED) accessToken || access_token
 * If present && genuine , pass and check the lifetime of the token
 * Otherwise, don't talk to him, just shO0ot him with a APIError
 *
 */
authCtrler.authorize = function checkApiToken (req, res, next) {
    // Check if token && token is mine
    // If ok, next(true)
    // Otherwise, throw ForbiddenError('You shall not pass ! Auth yourself first')
    next();
}


/**
 * Show the page to allow the user to grant a client.
 */
authCtrler.dialogPage = function dialogPage (req,res) {

    if(req.method === 'GET' && req.path === '/grant'){
        res.client.accessToken = undefined;
        return _dependencies.ctrlers.render.dialogPage(req,res);
    }

    return res.redirect('/auth/grant'+res.locals.query);
}


authCtrler.afterLoggedForGrant = function afterLoggedForGrant (req,res){
    //res.redirect('/auth/grant');
}

/**
 * The user allowed the client to gain acces to his data.
 */
authCtrler.grant = function grantApp (req,res,next) {
    console.log(req.body);
    debugger
    // if(req.body.choice === 'yes')
        // DB.App
};


/**
 * Error Handler
 */
authCtrler.errorHandler = function errorHandler (err, req, res, next) {
        // An error occured while
       if(req.method === 'GET' && req.path === '/grant' && err.status === 401 ) // An error occured while gather info about the client for display
        return authCtrler.dialogPage(req,res);

    // Create method to send only json for the errors
    // Send th err as json {status,err{status,message}
    res.status(err.status || 500).send(err.message || 'Some error occured, better formatin coming  !');
    //renderCtrl.errorPage(err,req,res);
};







/**
 * Exports
 */


// Export for /public auth
module.exports = authCtrler;
