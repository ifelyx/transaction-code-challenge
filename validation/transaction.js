/**
 * Created by Mystical on 10/07/2017.
 */
var Joi = require('joi');

module.exports = {
    body: {
        from: Joi.string().regex(/[0-9]{10}/).required(),
        to: Joi.string().regex(/[0-9]{10}/).required(),
        amount:Joi.number().positive().required()
    }
};