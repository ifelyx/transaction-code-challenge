var express = require('express');
var router = express.Router();
var models = require('../models');
const uuidv4 = require('uuid/v4');
var validate = require('express-validation')
var txnValidationSchema = require('../validation/transaction');
var mcache = require('memory-cache');

/* GET list transactions message. */
router.get('/', function (req, res, next) {
    models.Transaction.findAll().then(function (transactions) {
        res.send(transactions);
    });
});

/* POST transfer money between two accounts*/
//ensure request body is a valid json with the expected fields
router.post('/', validate(txnValidationSchema), (req, res) => {
    //call post transaction function to handle
    processTransaction(req.body, res);

});

//
const processTransaction = async (requestBody, res) => {
    let t = null;
    try {
        //ensure this request is not a duplicate transaction posted within 20 seconds
        let cacheKey = "key_"+requestBody.from+requestBody.to+requestBody.amount;
        console.log(cacheKey);
        let cachedBody = mcache.get(cacheKey)
        if (cachedBody) {
            res.status(409).send({error: "Duplicate transaction request"});
            return
        }

        //fetch from account
        let fromAccount = await models.Balance.findOne({where: {account_nr: requestBody.from}});

        //check if fromAccount exists
        if (!fromAccount) {
            return res.status(400).send({error: "Invalid from account: " + requestBody.from + " supplied"})
        }
        //does from account have a enough balance
        if (fromAccount.balance < requestBody.amount) {
            return res.status(400).send({error: "Insufficient balance in account: " + requestBody.from})
        }

        //fetch toAccount
        let toAccount = await models.Balance.findOne({where: {account_nr: requestBody.to}});
        //does it exist
        if (!toAccount) {
            return res.status(400).send({error: "Invalid to account: " + requestBody.to + " supplied"});
        }

        if(toAccount.account_nr === fromAccount.account_nr){
            return res.status(400).send({error: "From and to accounts cannot be the same"})
        }

        let sequelize = models.sequelize;

        //get transaction object
        t = await sequelize.transaction();

        //debit from account
        let response = await fromAccount.updateAttributes({
            balance: fromAccount.balance - requestBody.amount
        }, {transaction: t});

        //credit to account
        await toAccount.updateAttributes({
            balance: toAccount.balance + requestBody.amount
        }, {transaction: t});

        //create debit transaction for fromAccount
        await models.Transaction.create({
            reference: uuidv4(),
            account_nr: fromAccount.account_nr,
            amount: (-1 * requestBody.amount),
        }, {transaction: t});

        //create a credit transaction for to account
        await models.Transaction.create({
            reference: uuidv4(),
            account_nr: toAccount.account_nr,
            amount: requestBody.amount,
        }, {transaction: t});

        //commit transaction
        await t.commit();//commit

        //cache request for 20 seconds
        //this is to mitigate cases where a user mistakenly submits a request multiple times
        //within a period of 20 seconds after the initial request.
        //If the same account numbers and amount are found in the cache, it is safe to assume
        //it's a duplicate request
        //NB: in a production environment, a distributed cache service
        //like Redis would have been a better candidate for this,
        //to cater for cases where you have multiple instances of the application.
        mcache.put(cacheKey, requestBody, 20 * 1000);

        //send the current fromAccount state to client
        res.send(response);

    } catch (err) {
        if (t != null) {
            t.rollback();
        }
        return res.status(500).send({error: "Transaction failed due to server error"});
    }

}



module.exports = router;
