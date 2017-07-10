'use strict';

var app = require('../app');
var Bluebird = require('bluebird');
var expect = require('expect.js');
var request = require('supertest');

describe('Transaction api test', function () {
    before(function () {
        return require('../models').sequelize.sync();
    });

    beforeEach(function () {

        this.models = require('../models');
        return Bluebird.all([
            this.models.Balance.findOrCreate({
                where: {account_nr: "5405123564"},
                defaults: {account_nr: "5405123564", balance: 10000}
            })
                .then(balance => {
                    console.log("5405123564 created");
                }),
            this.models.Balance.findOrCreate({
                where: {account_nr: "5405123566"},
                defaults: {account_nr: "5405123566", balance: 10000}
            })
                .then(balance => {
                    console.log("5405123566 created");
                })
        ]);

    });

    it('posts correct transaction', function (done) {
        request(app).post('/transactions').
            type('form')
            .send({
                "from": "5405123564",
                "to": "5405123566",
                "amount": 230
            })
            .set('Accept', /application\/json/)
            .expect(200)
            .end(function (err, res) {
                done();
            });
    });

    it('posts insufficient balance', function (done) {
        request(app).post('/transactions').
            type('form')
            .send({
                "from": "5405123564",
                "to": "5405123566",
                "amount": 230000000
            })
            .set('Accept', /application\/json/)
            .expect(400)
            .end(function (err, res) {
                done();
            });
    });

    it('posts invalid account', function (done) {
        request(app).post('/transactions').
            type('form')
            .send({
                "from": "5405123567",
                "to": "5405123566",
                "amount": 230
            })
            .set('Accept', /application\/json/)
            .expect(400)
            .end(function (err, res) {
                done();
            });
    });


    it('posts invalid request', function (done) {
        request(app).post('/transactions').
            type('form')
            .send({
                "from": "5405123567",
                "amount": 230
            })
            .set('Accept', /application\/json/)
            .expect(400)
            .end(function (err, res) {
                done();
            });
    });
});