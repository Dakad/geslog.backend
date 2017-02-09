'use strict';

const nconf = require("nconf");

const Util = require('../../modules/util');


const AppsModel = function(sequelize, DataTypes) {
    const Apps = sequelize.define('Apps', {
        id: { // a unique string representing the registred app
            primaryKey: true,
            type: DataTypes.STRING,
            defaultValue: function() {
                return Util.generateShortUUID();
            },
        },
        name: { // App name required
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        secret: { //
            type: DataTypes.STRING,
        },
        redirectUri: {
            type: DataTypes.STRING,
            allowNull: false
        },
        useRedirectUri: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        scope: DataTypes.TEXT,

        type: { //  based on their ability to auth securely with the authorization server CONFIDENTIAL(TLS),PUBLIC
            type: DataTypes.ENUM('CONFIDENTIAL', 'PUBLIC'),
            allowNull: true,
        },

        description: DataTypes.TEXT,

        logo: DataTypes.TEXT,

        accessToken: DataTypes.STRING,

    }, {
        comment: "Contains the registered client app using the route '/api' ",
        schema: nconf.get('DATABASE_SCHEMA') || 'public',


        classMethods: {
            associate: function(models) {
                Apps.belongsToMany(models.Users, { as: 'consumers', through: models.AuthApps, foreignKey: 'consumer' });
                Apps.belongsTo(models.Users, {
                    as: 'apps',
                    foreignKey: 'owner'
                }); // Apps will keep the FK to Users

            }
        },


        instanceMethods: {
            hasLogo: () => (this.logo != null)
        },

        // Hooks are function that are called before and
        // after (bulk-) creation/updating/deletion and validation.
        hooks: {
            beforeCreate: function(app) {
                // First salt to be used as apiId
                return Util.generateSalt().then(function(secret) {
                        app.set('secret', secret);
                        return [app.get('id'), app.get('secret'), app.get('id').length]; // To be hashed
                        // Use id as salt, secret as pwd, decrease the size for easiness
                    }).spread(Util.hashPassword)
                    .done((token) => app.set('accessToken', token));
            },

            afterFind: function(client) {

            }


        }

    });
    return Apps;
};



module.exports = AppsModel;