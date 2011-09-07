var util = require('util'),
    Client = require('../redisev').Client;

var Slave = function () {
    this.basket = [];
};

util.inherits(Slave, Client);

module.exports.Slave = Slave;
