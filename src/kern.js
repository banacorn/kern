var hiredis = require('hiredis'),
    Queue   = require('../lib/queue').Queue;


var Kern = function () {
    this._socket;
    this._queue = new Queue;
}

Kern.prototype.createConnection = function (port, host) {

    var that = this;

    this._socket = hiredis.createConnection(
        port || 6379,
        host || '127.0.0.1'
    );
    
    /*
    **  setTimeout
    */
    
    this._socket.setTimeout(3000, function () {
        that._socket.emit('error', new Error('connect ETIMEDOUT'));
    });
    
    var clearTimeout = function () {
        that._socket.setTimeout(0);
    };
    
    this._socket
        .once('connect', clearTimeout)
        .once('data', clearTimeout)
        .once('error', clearTimeout)
        .once('reply', clearTimeout);
    
    
    /*
    **  reply
    */
    this._socket.on('reply', function (data) {
        //console.log(data.toString());
        var callback = that._queue.shift();
        if (callback)
            callback(data.toString())
        
    });
    
    
    
    this.on = function (ev, cb) {
        this._socket.on(ev, cb);
    };    
    
    this.end = function () {
        this._socket.end();
    }
    
    return this;
}

Kern.prototype.send = function () {


    var command     = [],
        callback,
        last        = arguments[arguments.length - 1];
    
    if (typeof last === 'function') {
            
        for (var i = 0, len = arguments.length; i < len - 1; i++) {
            command.push(arguments[i].toString());
        }
        callback = last;
        
    } else {
           
        for (var i = 0, len = arguments.length; i < len; i++) {
            command.push(arguments[i].toString());
        }
    }
    
    
    this._socket.write.apply(this, command);
    this._queue.push(callback);
}


module.exports = new Kern;
/*
module.exports.createConnection = function () {
    var kern = new Kern;
    kern.createConnection();
    kern.on = 
    return kern;
};*/
