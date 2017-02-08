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



apiCtrler.addStudents = function(req, res, next) {

}


apiCtrler.addProfiles = function(req, res, next) {
    var idProfil = req.body.idProfil;
    var idUsers = req.body.idUsers;

    if (!idProfil) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : Profil'));
    }
    if (!idUsers || idUsers.length == 0) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : User(s)'));
    }

    var profil = _dependencies.dal.Profiles.find({
        where: {
            id: idProfil
        }
    }).then(function(profil) {
        console.log(profil.getApplications());
    });


    // On commence par récupérer la liste des logiciels pour le profil reçu
    /*var AppList = _dependencies.dal.ListApps.findAll({
        where: {
            ProfileId: idProfile
        }
    });
    console.log(AppList);

    // Pour tout les logiciels de chaque utilisateur, on rajoute un accès. 
    /*  _dependencies.dal.Accesses.create({

     }); */


}

apiCtrler.addUser = function(req, res, next) {
    var newUser = req.body;
    if (!newUser.firstName) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : firstName'));
    }
    if (!newUser.name) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : Lastname'));
    }
    if (!newUser.type) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : type'));
    }
    if (newUser.type == 'PROF' && !newUser.email) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : email'));
    }

    if (newUser.type === 'GUEST') {
        var user = _dependencies.dal.Users.create({
            firstName: newUser.firstName,
            name: newUser.name,
            type: newUser.type
        }).then(function(user) {
            return sendJsonResponse(res, 200, JSON.stringify(user));
        }).catch(function(err) {
            console.log(err);
        });

    } else {
        var user = _dependencies.dal.Users.create({
            firstName: newUser.firstName,
            name: newUser.name,
            type: newUser.type,
            email: newUser.email
        }).then(function(user) {
            return sendJsonResponse(res, 200, JSON.stringify(user));
        }).catch(function(err) {

        });

    }


}

apiCtrler.listLogins = function listLogins(req, res, next) {
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
        return sendJsonResponse(res, 200, "Profil created");
        
    }).catch(function(err){
        console.log(err);
    })
};

//apiCtrler.deleteProfil = function deleteProfil(){
//    let name = 
//}


/**
 * Exports
 */

// Methods
module.exports = apiCtrler;