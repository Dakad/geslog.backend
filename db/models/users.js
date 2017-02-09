'use strict';

const nconf = require("nconf");

const Util = require('../../modules/util');


const UserModel = function(sequelize, DataTypes) {
    const Users = sequelize.define('Users', {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false

        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        year: DataTypes.STRING(2),

        orientation: DataTypes.STRING(3),

        email: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        matricule: {
            type: DataTypes.INTEGER,
            unique: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [
                    ['ADMIN', 'STUD', 'GUEST', 'PROF']
                ]
            }
        },
        login: {
            type: DataTypes.STRING,
            validate: {
                len: [7, 7]
            },
            //defa
        },
        password: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true,

        version: true,

        schema: nconf.get('DATABASE_SCHEMA') || 'public',



        classMethods: {
            associate: function(models) {
                Users.belongsTo(models.Profiles, {
                    foreignKey: {
                        allowNull: true,
                        name: 'profileId'

                    }
                });

                Users.belongsToMany(models.Applications, {
                    foreignKey: 'userId', // Will create a FK in Apps named 'owner'
                    onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
                    as: 'apps', // The FK in Apps will be aliased as 'owner'.
                    through: models.Accesses
                });
            }
        },
        hooks: {
            beforeCreate: function(user) {
                user.login = user.firstName.charAt(0).toLocaleLowerCase() + user.name.substring(0, 6).toLocaleLowerCase();
            }
        }
    });
    return Users;
};

module.exports = UserModel;