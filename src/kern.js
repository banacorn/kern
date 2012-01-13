var hiredis = require('hiredis'),
    Queue   = require('../lib/queue').Queue;


var Kern = function () {
    this._socket;
    this._queue = new Queue;
}

Kern.prototype.createConnection = function () {
    this._socket = hiredis.createConnection();
    this.on = this._socket.on;
    this.emit = this._socket.emit;
    this.end = this._socket.end;
    
    
    this._socket.on('connect', function () {
        console.log('connect')
    });

    
    return this;
    
}

Kern.prototype.send = function () {
}


module.exports = new Kern;
/*
module.exports.createConnection = function () {
    var kern = new Kern;
    kern.createConnection();
    kern.on = 
    return kern;
};*/
