'use strict';

/**
 * =============================
 *
 * DAO to handle CRUD  on Apps Model
 * All methods returns a Promise
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /
 *		- addApps()
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
const unless = require('express-unless');

// Custom - Mine
const InjectError = require('../../modules/di-inject-error');
const Util = require('../../modules/util');
const ApiError = require('../../modules/api-error');



// Injected
let _dependencies = {};
let DB;







const AppsDAO = {

    /**
     * Used for the D.I, receive all dependencies via opts
     * Will throw an InjectError if missing a required dependenccy
     * @parameter   {Object}    opts    Contains all dependencies needed by ths modules
     *
     */
    inject : function inject (opts) {

        if(!opts){
            throw new InjectError('all dependencies', 'AppsDAO.inject()');
        }

        if(!opts.dal) {
            throw new InjectError('dal', 'AppsDAO.inject()');
        }


        // Clone the options into my own _dependencies
        _dependencies = _.assign(_dependencies,opts);
        DB = _dependencies.dal;
    },


    build   : function (nApp){
        return DB.Apps.build(nApp);
    },

    delete : function (id){
        return DB.Apps.destroy({where : {id : id}});
    },

    update : function (nApp) {
        DB.Apps.findOrCreate(nApp,{
            // fields : ['appName', 'clientRedirectUri','useRedirectUri', 'description'],
            include: [{model : DB.Users,  as: 'apps'}]
        }).catch(errorHandler);
    },

    create : function (nClient) {
        let cond;
        cond = (nClient.id) ? {id: nClient.id} : {name: nClient.name};
        //const nClient = DB.build();
        return DB.Apps.findOrCreate({
            where: cond,
            defaults: nClient.get({plain: true})
        }).catch(errorHandler);
    },

    getUsersApps : function (id) {
        return DB.Apps.findAll({
            where: { owner: id},
        }).catch(errorHandler);
    },

    findById :  function (id,loggedUser) {
        return DB.Apps.findById(id).then(function(app){
            if(!app)
                throw new ApiError.NotFound('This client is not registred.');
            if( loggedUser &&app.owner !== loggedUser)
                throw new ApiError.Forbidden('You are not the owner of this appp.');

            return app;
        });
    },


    checkIfRegistred : function (client) {
        return DB.Apps.findOne({
            attributes :{exclude : ['logo','description','type']},
            where : {
                id : client.id || client.clientId,
                secret : client.secret || client.clientSecret
            }
        }).then(function(dbClient){
            if (!dbClient)
            throw new ApiError.NotFound('This client is not registred. Unknown id or secret!');
            return (dbClient) ? dbClient : new ApiError.NotFound('This client is not registred. Unknown id or secret!');
        });
    }








};






function errorHandler (err){

    console.log(err);
    debugger;

}


/**
 * Exports
 */

// Object

module.exports = AppsDAO;