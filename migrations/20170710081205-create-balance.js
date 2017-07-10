'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('balances', {
      account_nr: {
        unique:true,
        type: Sequelize.STRING
      },
      balance: {
        type: Sequelize.DECIMAL
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('balances');
  }
};