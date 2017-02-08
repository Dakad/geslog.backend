'use strict';

const nconf = require("nconf");

const Util = require('../../modules/util');


const UserModel = function(sequelize, DataTypes){
   const User =  sequelize.define('Users', {
        firstName :{
            type : DataTypes.STRING,
            allowNull : false
        },
        name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        year : {
            type : DataTypes.STRING(2),

        },
        orientation : {
            type : DataTypes.STRING(3),
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
            allowNull : false, 
            validate : {
                isIn : [['admin', 'student', 'prof']]
            }
        },
        login : {
            type : DataTypes.STRING,
            validate : {
                len : [7,7]
            },
            //defa
        },
        password : {
            type : DataTypes.STRING
        }
    }, {
        paranoid : true,

        version : true,

        schema: nconf.get('DATABASE_SCHEMA') || 'public',


        classMethod : {
            associate : function(models){
                Users.belongsTo(model.Profil, {
                    foreignKey : {
                        name : 'idProfil',
                        allowNull : true,
                        primaryKey : true
                    }

                });

                 Users.belongsToMany(models.Applications, {
                     foreignKey: 'idUser', // Will create a FK in Apps named 'owner'
                     onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
                     as: 'apps', // The FK in Apps will be aliased as 'owner'.
                     through: models.Accesses
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