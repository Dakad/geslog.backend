'use strict';

const Util = require('../../modules/util');


const USerModel = function(sequelize, DataTypes){
   const Users =  sequelize.define('Users', {
        firstName :{
            type : DataTypes.STRING,
            allowNull : false
        },
        name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        year : {
            type : DataTypes.STRING,
            validate : {
                len : [2,2]
            }
        },
        orientation : {
            type : DataTypes.STRING,
            validate : {
                len : [3,3]
            }
        },
        email : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                isEmail : true
            }
        },
        matricule : {
            type : DataTypes.INTEGER,
            unique : true
        },
        type : {
            type : DataTypes.STRING,
            allowNull = false, 
            validate : {
                isIn : [['admin', 'student', 'prof']]
            }
        },
        login : {
            type : DataTypes.STRING,
            validate : {
                len : [7,7]
            }
        },
        password : {
            type : DataTypes.STRING
        },
        salt : {
            type : DataTypes.STRING
        }
    }, {
        paranoid : true,

        version : true,

        classMethod : {
            associate : function(models){
                Users.hasOne(model.Profil, {
                    foreignKey : {
                        name : 'idProfil',
                        allowNull : true
                    }

                });
            }
        },
        hooks: {
            beforeCreate: function (user) {
                if(user.type == 'admin' && user.password != null){
                    return Util.generateSalt().then(function(salt){
                    user.set('salt', salt);
                    return [user.pwd,salt];
                    }).spread(Util.hashPassword)
                    .then(function (hashedPwd) {
                        user.set('pwd', hashedPwd);
                    });
                }
            }
    }
    });
    return User;
};

module.exports = UserModel;