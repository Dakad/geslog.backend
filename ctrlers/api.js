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
const ApiError = require('../modules/api-error');
const InjectError = require('../modules/di-inject-error');
const Util = require('../modules/util');
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
        "err": {
            'status': err.status,
            'message': err.message
        },
        "status": err.status
    };
    res.status(resObj.status).json(resObj);
};




apiCtrler.zen = function zen(req, res, next) {
    return sendJsonResponse(res, 200, 'Hello, I\' will soon give u some deep shit quotes ! Just wait for it !');
}

apiCtrler.checkIfToken = function checkIfToken(req, res, next) {
    const nonAuthRoutes = ['/', '/zen', '/connect'];
    if (nonAuthRoutes.indexOf(req.path.toLowerCase()) >= 0) {
        next();
        return;
    }
    const token = req.headers['X-GesLog-Auth'];
    if (!token) {
        return sendJsonError(res, new ApiError.Unauthorized('Missing the authorization token (X-GesLog-Auth) in the headers'));
    }

    Util.validToken(token).then((user) => {
        req.client = req.user = user;
        return next(req, res);
    }).catch((err) => {
        return sendJsonError(res, new ApiError.Forbidden('The token is compromised ! re-Connect to get another'));
    });
}



apiCtrler.connect = function connect(req, res, next) {
    // Check if user exists
    // If exists, generate Token
    let type = req.body.type;
    if (!type) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : type'));
    }

    

    let conditions;
    if (type === 'STUD') {
       
        let matricule = req.body.matricule;
        if (!matricule) {
            return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : matricule'));
        }
        conditions = {
            where: {
                'matricule': matricule
            }
        }
         
    }
    else {
        if (type === 'PROF') {
            let password = req.body.password;
            if (!password) {
                return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : password'));
            }
            conditions = {
                where: {
                    'password': password
                }
            }
        }
    }
    _dependencies.dal.Users.findOne(conditions).then(function(user) {
        if (!user) {
            throw new ApiError.NotFound("this password is invalid");
        }
        return [Util.generateToken({
            id: user.id,
            login: user.login,
            type: user.type,
        }), user];
    }).spread(function(token, user) {
        return sendJsonResponse(res, 200, {
            "token": token,
            "type": user.type,
            "matricule": user.matricule
        });
    }).catch((err) => sendJsonError(res, err));
};



apiCtrler.addStudents = function(req, res, next) {

}


apiCtrler.addProfiles = function(req, res, next) {
    var profilId = req.body.profilId;
    var userIds = req.body.userIds;

    if (!profilId) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : Profil'));
    }
    if (!userIds) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : User(s)'));
    }

    userIds = JSON.parse(userIds);
    if (userIds.length == 0) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : User(s)2'));
    }


    var profil = _dependencies.dal.Profiles.findOne({
        where: {
            id: profilId
        },
        include: [{
            model: _dependencies.dal.Applications,
            as: 'apps'
        }]
    }).then(function(profil) {
        profil.apps.forEach(function(app) {
            userIds.forEach(function(userId) {
                _dependencies.dal.Accesses.create({
                    userId: userId,
                    appId: app.id
                });
            });
        });
        // Demander à David ce qu'on doit renvoyer réponse.
        // Oubien faire un redirect faire getUsers? 

        // Pas besoin, ca fait du traitement pour rien il va les demander lui-même 
        // Si besoin , le true est parfait
        return sendJsonResponse(res, 200, true);
    }).catch(function(err) {
        console.log(err);
        return sendJsonError(res, err)
    });

    // Pour tout les logiciels de chaque utilisateur, on rajoute un accès. 



}

apiCtrler.addUser = function(req, res, next) {
    var newUser = req.body;
    if (!newUser.firstName) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : firstName'));
    }
    if (!newUser.name) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    if (!newUser.type) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : type'));
    }
    if (newUser.type == 'PROF' && !newUser.email) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : email por type prof'));
    }

    var user;

    if (newUser.type === 'GUEST') {
        user = _dependencies.dal.Users.create({
            firstName: newUser.firstName,
            name: newUser.name,
            type: newUser.type
        });
    }
    else {
        user = _dependencies.dal.Users.create({
            firstName: newUser.firstName,
            name: newUser.name,
            type: newUser.type,
            email: newUser.email
        });
    }

    user.then(function(user) {
        return sendJsonResponse(res, 200, JSON.stringify(user));
    }).catch(function(err) {
        console.log(err);
        sendJsonError(res, err);
    });


}

apiCtrler.listLogins = function listLogins(req, res, next) {
    // REcup matricule from params
    let matricule = Number.parseInt(req.params.matricule);
    if (!matricule) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : matricule'));
    }

    // Go find this user with this matricule
    _dependencies.dal.Users.find({
        where: {
            'matricule': matricule
        }
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

apiCtrler.getProfil = function getProfil(req, res, next) {
    let name = req.params.name;
    //console.log(name);
    if (name) {
        _dependencies.dal.Profiles.find({
            where: {
                'name': name
            }
        }).then(function(profil) {
            if (!profil) {
                throw new ApiError.NotFound('this profil name is invalid');
            }
            return sendJsonResponse(res, 200, JSON.stringify(profil));
        }).catch((err) => sendJsonError(res, err));
    }
    else {
        _dependencies.dal.Profiles.findAll().then(function(profils) {
            return sendJsonResponse(res, 200, JSON.stringify(profils));
        }).catch((err) => sendJsonError(res, err));

    }
};

apiCtrler.setProfil = function setProfil(req, res, next) {
    let name = req.body.name;
    if (!name) {
        throw new ApiError.BadRequest('Missing the parameter : name');
    }
    _dependencies.dal.Profiles.upsert({
        'name': name
    }).then(function(created) {
        if (!created) {
            throw new ApiError.BadRequest('Failed to create Profil');
        }
        return sendJsonResponse(res, 201, "Profil created");
    }).catch(function(err) {
        console.log(err);
        sendJsonError(res, err);
    })
};

apiCtrler.deleteProfil = function deleteProfil(req, res, next) {
    let id = req.body.id;
    if (!id) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    _dependencies.dal.Profiles.destroy({
        where: {
            'id': id
        }
    }).then(function(destroyed) {
        if (!destroyed) {
            throw new ApiError.NotFound('This profil name is invalid');
        }
        return sendJsonResponse(res, 200, "Profil deleted");
    }).catch((err) => sendJsonError(res, err));


}

apiCtrler.getApp = function getApp(req, res, next) {
    let id = req.params.id;
    if (id) {
        _dependencies.dal.Applications.findById(id).then(function(app) {
            if (!app) {
                throw new ApiError.NotFound('This application id is invalid');
            }
            return sendJsonResponse(res, 200, JSON.stringify(app));
        }).catch((err) => sendJsonError(res, err));
    }
    else {
        _dependencies.dal.Applications.findAll().then(function(apps) {
            return sendJsonResponse(res, 200, apps);
        })
    }
};

apiCtrler.setApp = function setApp(req, res, next) {
    let name = req.body.name;
    let format = req.body.format;
    if (!name) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    if (!format) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : format'));
    }
    _dependencies.dal.Applications.upsert({
        'name': name,
        'format': format
    }).then(function(created) {
        if (!created) {
            return sendJsonResponse(res, 200, 'Application updated');
        }
        return sendJsonResponse(res, 201, "Application created");
    }).catch(function(err) {
        console.log(err);
        sendJsonError(res, err);
    })
};

apiCtrler.deleteApp = function deleteApp(req, res, next) {
    let id = req.body.id;
    if (!id) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : name'));
    }
    _dependencies.dal.Applications.destroy({
        where: {
            'id': id
        }
    }).then(function(destroyed) {
        if (!destroyed) {
            throw new ApiError.NotFound('This Application name is invalid');
        }
        return sendJsonResponse(res, 200, "Application deleted");
    }).catch((err) => sendJsonError(res, err));
};

apiCtrler.listUsers = function listUsers(req, res, next) {
    _dependencies.dal.Users.findAll({
        include: [{
            model: _dependencies.dal.Profiles,
            // as: 'profiles'
        }]
    }).then(function(users) {
        return sendJsonResponse(res, 200, users);
    }).catch((err) => sendJsonError(res, err));

};




/**
 * Exports
 */

// Methods
module.exports = apiCtrler;
