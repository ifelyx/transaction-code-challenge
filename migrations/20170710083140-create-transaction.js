'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('transactions', {
      reference: {
        unique:true,
        type: Sequelize.STRING
      },
      account_nr: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DECIMAL
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('transactions');
  }
};