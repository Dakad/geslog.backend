'use strict';

const nconf = require("nconf");


const Util = require('../../modules/util');


const ApplicationModel = function(sequelize, DataTypes) {
  const Applications = sequelize.define('Applications', {
    name: {
      type:DataTypes.STRING,
      allowNull : false
    },
    format:{
      type:DataTypes.STRING,
      allowNull : false
    }
  }, {
    comment: "Contains all applications registred into the app.",
    schema:nconf.get('DATABASE_SCHEMA') || 'public',



    // don't delete database entries but set the newly added attribute deletedAt
    // to the current date (when deletion was done).
    // paranoid will only work if timestamps are enabled
    paranoid: true,

    // Enable optimistic locking.  When enabled, sequelize will add a version count attriubte
    // to the model and throw an OptimisticLockingError error when stale instances are saved.
    // Set to true or a string with the attribute name you want to use to enable.
    version: true,

    classMethods: {
      associate: function(models) {
         // To keep all apps registred data through the API
         Applications.belongsToMany(models.Users,{
             foreignKey: 'idApp', // Will create a FK in Apps named 'owner'
             onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
             as: 'users', // The FK in Apps will be aliased as 'owner'.
			       through: models.Accesses
         });

        // To keep all apps allowed by the user to get data
        Applications.belongsToMany(models.Profiles,{
            foreignKey: 'idApp', // Will create a FK in Apps named 'owner'
            onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
            as: 'profiles', // The FK in Apps will be aliased as 'owner'.
			      through: 'ListApps'
        });

      }
    } ,

    // Hooks are function that are called before and
    // after (bulk-) creation/updating/deletion and validation.
    hooks: {
        beforeCreate: function (app) {
         //   return Util.generateSalt().then(function(salt){
        //      user.set('salt', salt);
         //     return [user.pwd,salt];
       //     }).spread(Util.hashPassword)
      //      .then(function (hashedPwd) {
      //          user.set('pwd', hashedPwd);
      //      });
        }
    }



  });

    return Applications;
};



module.exports = ApplicationModel;