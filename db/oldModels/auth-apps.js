'use strict';

const nconf = require("nconf");

const Util = require('../../modules/util');


const AuthAppsModel = function(sequelize, DataTypes) {
    const AuthApps = sequelize.define('AuthApps', {
        // client: { // App required
        //   type:DataTypes.UUID,
        //   primaryKey: true,

        // }
    }, {
        comment: "Contains the app authorized by User to acces their data",
        schema: nconf.get('DATABASE_SCHEMA') || 'public',

        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,

        classMethods: {
            associate: function(models) {

                // AuthApps.Consumers = AuthApps.belongsToMany(models.Users,{
                //     foreignKey: 'consumer', // Will create a FK in Coxes named 'app'.
                //     through: models.AuthApps,
                //     as: 'consumers', // The FK in AuthApps will be aliased/accessible as 'authApps'.
                // });

                // // To keep all apps allowed by the user to get data
                // AuthApps.AuthApps = AuthApps.belongsToMany(models.Boxes, {
                //     foreignKey: 'app', // Will create a FK in Coxes named 'app'.
                //     through: models.AuthApps,
                //     as: 'authApps', // The FK in AuthApps will be aliased/accessible as 'authApps'.
                // });

            }
        },

        // Hooks are function that are called before and
        // after (bulk-) creation/updating/deletion and validation.
        hooks: {
            beforeCreate: function(code) {

            },
        }

    });
    return AuthApps;
};



module.exports = AuthAppsModel;