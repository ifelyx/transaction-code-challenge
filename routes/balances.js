var express = require('express');
var router = express.Router();

var models = require('../models');


/* GET display list of balances. */
router.get('/', function (req, res, next) {
    models.Balance.findAll().then(function (balances) {
        res.send(balances);
    });
});

module.exports = router;
