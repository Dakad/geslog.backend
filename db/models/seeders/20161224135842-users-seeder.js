'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
    */
      return queryInterface.bulkInsert('Users', [{
        email: 'test@email.com',
        name: 'Anders Nygma O\'Nyme ',
        isAdmin: true
      },{
        email: 'LursaBolloch@dayrep.com',
        name: 'Isra Hamidah Balsam Cham',
        isAdmin: false
      }], {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
    */
      return queryInterface.bulkDelete('Users', null, {});
  }
};
