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
const fs = require('fs');




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
    // console.log(req.headers);
    console.log(req.body);
    // const nonAuthRoutes = ['/', '/zen', '/connect'];
    // if (nonAuthRoutes.indexOf(req.path.toLowerCase()) >= 0) {
    //     next();
    //     return;
    // }
    // const token = req.headers['X-GesLog-Auth'];
    // if (!token) {
    //     return sendJsonError(res, new ApiError.Unauthorized('Missing the authorization token (X-GesLog-Auth) in the headers'));
    // }

    // Util.validToken(token).then((user) => {
    //     req.client = req.user = user;
    //     return next(req, res);
    // }).catch((err) => {
    //     return sendJsonError(res, new ApiError.Forbidden('The token is compromised ! re-Connect to get another'));
    // });

    next();
}



apiCtrler.connect = function connect(req, res, next) {
    // Check if user exists
    // If exists, generate Token
    let type = req.body.type;
    if (!type) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : type'));
    }

    type = type.toUpperCase();


    let conditions;
    if (type === 'STUD') {

        let matricule = Number.parseInt(req.body.matricule);
        if (!matricule) {
            return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : matricule'));
        }
        conditions = {
            where: {
                'matricule': matricule
            }
        }

    } else {
        if (type === 'ADMIN') {
            let password = req.body.password;
            if (!password) {
                return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : password'));
            }
            conditions = {
                where: {
                    'password': password,
                    'type': 'ADMIN'
                }
            }
        }
    }
    _dependencies.dal.Users.findOne(conditions).then(function(user) {
        if (!user) {
            throw new ApiError.NotFound('This user is not defined\'');
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



apiCtrler.importUsers = function(req, res, next) {
    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }


    var file = req.files.file.data.toString('ascii').split('\n');
    var users = [];
    file.forEach(function(line, index) {
        if (index === 0) {
            return;
        }

        var user = line.replace(/["\r]/g, '').split(',');
        _dependencies.dal.Users.create({
            matricule: user[0],
            firstName: user[1],
            lastName: user[2],
            year: user[3],
            orientation: user[4],
            email: user[5],
            type: 'STUD'
        });
    });


    //console.log(test);
    /*fs.readFile(req.files.file.data, 'utf-8', (err, data) => {
        if (err) throw err;
        //console.log(data);
    });*/

}


apiCtrler.getScript = function(req, res, next) {
    var id = Number.parseInt(req.params.appId);
    // Ajouter du code pour les vérifications
    if (!id) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : id'));
    }

    _dependencies.dal.Applications.findOne({
        where: { id: id },
    }).then(function(app) {
        if (!app) {
            throw new ApiError.NotFound("This application is not defined");
        }
        var fields = app.format.split('#');
        var format = fields[0];
        var delimiter = fields[1];
        fields = fields.slice(2);
        return [format, delimiter, _dependencies.dal.Applications.findOne({
            where: { id: app.id },
            include: [{ attributes: fields, model: _dependencies.dal.Users, as: 'users' }]
        })];
    }).spread(function(format, delimiter, app) {
        var data = {
            format: format,
            script: []
        };
        if (!app.users) {
            throw new ApiError.NotFound('No user defined for this application');
        }
        app.users.forEach(function(user) {
            var ligne = '';
            if (format === 'bat') {
                ligne = 'dsadd user ';
            }
            // console.log(user);
            Object.keys(user.dataValues).forEach(function(field, index, array) {

                switch (format) {
                    case 'bat':
                        if (index === array.length - 1) {
                            ligne += 'mdp=' + user.Accesses.password;
                            return;
                        }
                        ligne += field + '=' + user.get(field);
                        break;
                    case 'csv':
                        if (index === array.length - 1) {
                            ligne += user.Accesses.password;
                            return;
                        }
                    default:
                        ligne += user.get(field);
                        break;
                }


                if (index !== array.length - 1) {
                    ligne += delimiter;
                }
            });
            data.script.push(ligne);
        });

        return sendJsonResponse(res, 201, data);
    }).catch((err) => sendJsonError(res, err));





}


apiCtrler.addProfiles = function(req, res, next) {
    let profilId = req.body.profil;

    if (!profilId) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : profil'));
    }
    if (!req.body.users) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : users'));
    }

    console.log(req.body.users);
    let userIds = req.body.users; //.split(',');
    if (userIds.length == 0) {
        return sendJsonError(res, new ApiError.BadRequest('The parameter user is empty'));
    }



    _dependencies.dal.Profiles.findOne({
        where: {
            id: profilId
        },
        include: [{
            model: _dependencies.dal.Applications,
            as: 'apps'
        }]
    }).then(function(profil) {
        //console.log(profil.apps);
        profil.apps.forEach(function(app) {
            userIds.forEach(function(userId) {
                _dependencies.dal.Accesses.create({
                    userId: userId,
                    appId: app.id
                });
            });
        });

        userIds.forEach(function(userId) {
            _dependencies.dal.Users.update({ profileId: profilId }, {
                where: { id: userId }
            });
        });

        return sendJsonResponse(res, 200, 'Profil asigned to user(s)');
    }).catch(function(err) {
        console.log(err);
        return sendJsonError(res, err)
    });





}
apiCtrler.addUser = function(req, res, next) {
    var newUser = req.body;

    if (!newUser) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter'));
    }

    if (!newUser.firstName) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : firstName'));
    }
    if (!newUser.lastName) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : lastName'));
    }

    if (!newUser.type) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : type'));
    }
    if (newUser.type == 'PROF' && !newUser.email) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : email for prof'));
    }

    var user;

    if (newUser.type === 'GUEST') {
        user = _dependencies.dal.Users.create({
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            type: newUser.type
        });
    } else {
        user = _dependencies.dal.Users.create({
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            type: newUser.type,
            orientation: newUser.orientation,
            matricule: newUser.matricule,
            email: newUser.email
        });
    }

    user.then(function(user) {
        return sendJsonResponse(res, 201, user);
    }).catch(function(err) {
        console.log(err);
        sendJsonError(res, err);
    });


}


apiCtrler.listLogins = function listLogins(req, res, next) {
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
        console.log(logins.toJSON());
        if (!logins) {
            logins = {};
        }
        return sendJsonResponse(res, 200, logins);
    });
};


apiCtrler.getProfil = function getProfil(req, res, next) {
    let id = req.params.id;
    if (id) {
        _dependencies.dal.Profiles.find({
            where: { id: id }
        }).then(function(profil) {
            if (!profil) {
                throw new ApiError.NotFound('This profil id is invalid');
            }
            return sendJsonResponse(res, 200, profil);
        }).catch((err) => sendJsonError(res, err));
    } else {
        _dependencies.dal.Profiles.findAll().then(function(profils) {
            return sendJsonResponse(res, 200, profils);
        }).catch((err) => sendJsonError(res, err));

    }
};

apiCtrler.setProfil = function setProfil(req, res, next) {
    let name = req.body.name;
    if (!name) {
        throw new ApiError.BadRequest('Missing the parameter : name');
    }
    let values = {
        'name': name
    };
    if (req.body.id) {
        values.id = req.body.id;
    }
    _dependencies.dal.Profiles.upsert(values).then(function(created) {
        if (!created) {
            return sendJsonResponse(res, 200, 'Profil updated');
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
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : id'));
    }
    _dependencies.dal.Profiles.destroy({
        where: {
            'id': id
        }
    }).then(function(destroyed) {
        if (!destroyed) {
            throw new ApiError.NotFound('This profil name is invalid');
        }
        return sendJsonResponse(res, 204, "Profil deleted");
    }).catch((err) => sendJsonError(res, err));


}


apiCtrler.getApp = function getApp(req, res, next) {
    let id = req.params.id;
    if (id) {
        _dependencies.dal.Applications.findById(id).then(function(app) {
            if (!app) {
                throw new ApiError.NotFound('This application id is invalid');
            }
            return sendJsonResponse(res, 200, app);
        }).catch((err) => sendJsonError(res, err));
    } else {
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
    let values = {
        'name': name,
        'format': format
    };
    if (req.body.id) {
        values.id = req.body.id;
    }
    _dependencies.dal.Applications.upsert(values).then(function(created) {
        if (!created) {
            return sendJsonResponse(res, 201, 'Application updated');
        }
        return sendJsonResponse(res, 201, "Application created");
    }).catch(function(err) {
        console.log(err);
        sendJsonError(res, err);
    })
};

apiCtrler.deleteApp = function deleteApp(req, res, next) {
    let id = req.params.id;
    if (!id) {
        return sendJsonError(res, new ApiError.BadRequest('Missing the parameter : id'));
    }
    _dependencies.dal.Applications.destroy({
        where: {
            'id': id
        }
    }).then(function(destroyed) {
        if (!destroyed) {
            throw new ApiError.NotFound('This Application id is invalid');
        }
        return sendJsonResponse(res, 200, "Application deleted");
    }).catch((err) => sendJsonError(res, err));
};


// Route à tester !!!
apiCtrler.listUsers = function listUsers(req, res, next) {
    _dependencies.dal.Users.findAll({
        where: { $not: { type: 'ADMIN' } },
        include: [{
            model: _dependencies.dal.Profiles,
            as: 'profil'
        }]
    }).then(function(users) {
        console.log(users);
        return sendJsonResponse(res, 200, users);
    }).catch((err) => sendJsonError(res, err));
};




/**
 * Exports
 */

// Methods
module.exports = apiCtrler;