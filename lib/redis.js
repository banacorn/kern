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
    self._socket = hiredis.createConnection(port, host);
    
    // homemade setTimeout, because socket's setTimeout clashes badly    
    var alarm = setTimeout(function () {
        self._emitter.emit('error', 'ETIMEDOUT');
    }, 500);
    
    // on connect
    self._socket.on('connect', function () {
    
        // clear our homemade setTimeout bomb
        clearTimeout(alarm);
                
        self._emitter.emit('connect');
    });
    
    // on error
    self._socket.on('error', function(err) {
        self._emitter.emit('error', err);
    });    
    
    // on reply
    self._socket.on('reply', function(res) {
        self._emitter.emit('redis reply', res);
    });    
    
    self.write = self._socket.write;
};

Redis.prototype.disconnect = function (port, host) {
    this._socket.destroy();
};



module.exports.Redis = Redis;
