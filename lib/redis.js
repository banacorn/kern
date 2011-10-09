var hiredis = require('hiredis');

// ********************
//     Constructor
// ********************

function Redis (emitter) {
    this._emitter = emitter;
    this._socket;
}

// ********************
//     Methods
// ********************

Redis.prototype.createConnection = function (port, host) {
    
    
    var self = this;
    
    // connect to redis
    this._socket = hiredis.createConnection(port, host);
    
    // homemade setTimeout, because socket's setTimeout clashes badly    
    var alarm = setTimeout(function () {
        self._emitter.emit('error', 'ETIMEDOUT');
    }, 1000);
    
    // on connect
    this._socket
        .on('connect', function () {
        
            // clear our homemade setTimeout bomb
            clearTimeout(alarm);
                    
            self._emitter.emit('connect');
        }).on('error', function(err) {
            self._emitter.emit('error', err);
        }).on('reply', function(res) {
            self._emitter.emit('redis reply', res);
        });
    
    this.write = this._socket.write;
};

Redis.prototype.disconnect = function (port, host) {
    this._socket.destroy();
};

module.exports.Redis = Redis;
