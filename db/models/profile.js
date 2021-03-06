'use strict';

const nconf = require("nconf");

const Util = require('../../modules/util');

const ProfilModel = function(sequelize, DataTypes) {
    const Profiles = sequelize.define('Profiles', {
        name: DataTypes.STRING
    }, {
        paranoid: true,
        version: true,
        schema: nconf.get('DATABASE_SCHEMA') || 'public',
        classMethods: {
            associate: function(models) {
                Profiles.belongsToMany(models.Applications, {
                    foreignKey: 'idProfil',
                    onDelete: "CASCADE", // If the box is deleted, don't keep any record of it. JUST DELETE
                    as: 'apps', // The FK in Apps will be aliased as 'owner'.
                    through: 'ListApps'
                });
            }
        }
    });


    return Profiles;
}

module.exports = ProfilModel;