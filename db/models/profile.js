'use strict';

const nconf = require("nconf");

const Util = require('../../modules/util');

const ProfilModel = function (sequelize, DataTypes){
    const Profil = sequelize.define('Profiles', {

        year : {
            type : DataTypes.STRING(2)
        },
        orientation : {
            type : DataTypes.STRING(3)
        }
    }, {
        schema: nconf.get('DATABASE_SCHEMA') || 'public',
        classMethod : {
            associate : function(models){
                Profil.belongsToMany(models.Applications, {
                    foreignKey : 'idProfil',
                    onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
                    as: 'apps', // The FK in Apps will be aliased as 'owner'.
			        through: 'ListApps'
                });
            }
        }
    });
    return Profil;
}

module.exports = ProfilModel;