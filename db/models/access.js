'use strict';

const nconf = require("nconf");


const Util = require('../../modules/util');


const AcessModel = function(sequelize, DataTypes) {
    const Access = sequelize.define('Accesses', {
        password: {
            type: DataTypes.STRING
        }
    }, {
        comment: "Contains all access registred into the app.",
        schema: nconf.get('DATABASE_SCHEMA') || 'public',

        // Add the timestamp attributes (updatedAt, createdAt, deletedAt) to database entries
        timestamps: true,

        // don't delete database entries but set the newly added attribute deletedAt
        // to the current date (when deletion was done).
        // paranoid will only work if timestamps are enabled
        // paranoid: true,

        // Enable optimistic locking.  When enabled, sequelize will add a version count attriubte
        // to the model and throw an OptimisticLockingError error when stale instances are saved.
        // Set to true or a string with the attribute name you want to use to enable.
        // version: true,

        classMethods: {
            associate: function(models) {
                // To keep all apps registred data through the API
                // Access.belongsToMany(models.Users,{
                //     foreignKey: 'User', // Will create a FK in Apps named 'owner'
                //     onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
                //    as: 'IdUser', // The FK in Apps will be aliased as 'owner'.
                // }),

                // To keep all apps allowed by the user to get data
                // Access.belongsToMany(models.Applications, {
                //     foreignKey: 'app', // Will create a FK in AuthApps named 'app'.
                //     through: models.AuthApps,
                //       as: 'IdApp', // The FK in AuthApps will be aliased/accessible as 'authApps'.
                //   });

            }
        },

        // Hooks are function that are called before and
        // after (bulk-) creation/updating/deletion and validation.
        hooks: {
            beforeCreate: function(access) {
                access.set('password', Util.generateShortUUID());
            }
        }



    });

    return Access;
};



module.exports = AcessModel;