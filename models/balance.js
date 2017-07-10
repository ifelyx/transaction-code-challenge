'use strict';
module.exports = function (sequelize, DataTypes) {
    var Balance = sequelize.define('Balance', {
        account_nr: DataTypes.STRING,
        balance: DataTypes.DECIMAL
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
            }
        }
    });
    Balance.findOrCreate({where: {account_nr: "5405123564"}, defaults: {account_nr: "5405123564", balance: 10000}})
        .then(balance => {
            console.log("5405123564 created");
        });
    Balance.findOrCreate({where: {account_nr: "5405123566"}, defaults: {account_nr: "5405123566", balance: 10000}})
        .then(balance => {
            console.log("5405123566 created");
        });

    return Balance;
};