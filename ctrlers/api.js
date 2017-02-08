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

apiCtrler.connect = function connect(req, res, next) {
    // Check if user exists
    // If exists, generate Token
	let password = req.body.password;
	if(!password)
	{
		return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : passwd'));
	}
	
	_dependencies.dal.Users.findOne({
		where:{'password':password}
	}).then(function(user)
	{
		if(!user)
		{
			return sendJsonError(res, new ApiError.NotFound("this passwd is invalid"));
		}
		return [Util.generateToken(user.type),user];
	}).spread(function(token,user)
	{
		return sendJsonResponse(res, 200, { "token": token, "type": user.type ,"matricule": user.matricule});
	})
};



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

apiCtrler.getProfil = function getProfil(req,res,next) {
    let name = req.params.name;
    //console.log(name);
    if(name)
    {
       _dependencies.dal.Profiles.find({
        where:{'name':name}
        }).then(function(profil)
        {
            if(!profil)
            {
                return sendJsonError(res, new ApiError.NotFound('this profil name is invalid'));
            }
            return sendJsonResponse(res, 200, JSON.stringify(profil));
        })
    }
    else
    {
    
        _dependencies.dal.Profiles.findAll().then(function(profils)
        {
            return sendJsonResponse(res, 200, JSON.stringify(profils));
        })
    }
};

apiCtrler.setProfil = function setProfil(req,res,next){
    let name = req.body.name;
    if(!name)
    {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    _dependencies.dal.Profiles.upsert({
        'name':name
    }).then(function(created){
        if(!created)
        {
            return sendJsonError(res, new ApiError.BadRequest('Failed to create Profil'));
        }
        return sendJsonResponse(res, 201, "Profil created");
        
    }).catch(function(err){
        console.log(err);
    })
};

apiCtrler.deleteProfil = function deleteProfil(req,res,next){
    let id = req.body.id;
    if(!id)
    {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    _dependencies.dal.Profiles.destroy({
       where: { 'id':id }
    }).then(function(destroyed){
        if(destroyed === 0)
        {
             return sendJsonError(res, new ApiError.NotFound('this profil name is invalid'));
        }
        return sendJsonResponse(res, 200, "Profil deleted");
    })
    
}

apiCtrler.getApp = function getApp(req,res,next) {
    _dependencies.dal.Applications.findAll().then(function(app)
    {
        return sendJsonResponse(res, 200, JSON.stringify(app));
    })
            
    
};

apiCtrler.setApp = function setApp(req,res,next){
    let name = req.body.name;
    let format = req.body.format;
    if(!name)
    {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    if(!format)
    {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : format'));
    }
    _dependencies.dal.Applications.upsert({
        'name':name,'format':format
    }).then(function(created){
        if(!created)
        {
            return sendJsonError(res, new ApiError.BadRequest('Failed to create Application'));
        }
        return sendJsonResponse(res, 201, "Application created");
        
    }).catch(function(err){
        console.log(err);
    })
};

apiCtrler.deleteApp = function deleteApp(req,res,next){
    let id = req.body.id;
    if(!id)
    {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    _dependencies.dal.Applications.destroy({
       where: { 'id':id }
    }).then(function(destroyed){
        if(destroyed === 0)
        {
             return sendJsonError(res, new ApiError.NotFound('this Application name is invalid'));
        }
        return sendJsonResponse(res, 200, "Application deleted");
    })
};

apiCtrler.listUsers = function listUsers(req,res,next){
    _dependencies.dal.Users.findAll({
        include: [{
            model: _dependencies.dal.Profiles,
            as: 'profiles'
        }]
    }).then(function(users)
    {
        return sendJsonResponse(res, 200, JSON.stringify(users));
    })

};

/**
 * Exports
 */

// Methods
module.exports = apiCtrler;