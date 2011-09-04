var emitter = require('events').EventEmitter
    hiredis = require('hiredis');


var Client = function() {

    // socket    
    this._client;
    
    // queue for reply callbacks    
    this._queue = [];
}

Client.prototype._authenticate = function(auth) {

    var self = this;

    // authenticate to the server
    self.send('AUTH', auth || '', function(err, res) {
        if (err === undefined)
            self._client.emit('ready');
        else
            self._client.emit('error', err);
    });
};


Client.prototype.connect = function(port, host, auth) {  
  
    var self = this;
    
    // connect to redis
    self._client = hiredis.createConnection(
        port || 6379, 
        host || 'localhost'
    );
    
    
    
    // homemade setTimeout, because socket's setTimeout clashes badly    
    var alarm = setTimeout(function() {
        console.log('ETIMEDOUT');
    }, 500);
    
    // on connect
    self._client.on('connect', function() {
    
        // clear our homemade setTimeout bomb
        clearTimeout(alarm);
        
        // authenticate
        self._authenticate(auth);
    });
    
    // on error
    self._client.on('error', function(err) {
        console.log(err);
    });
    
    // on ready
    self._client.on('ready', function(err) {
        console.log('READY!!');        
    });
    
    // on reply, emitted by hiredis
    self._client.on('reply', function(res) {
    
        // shift the callback in the queue on reply
        // check if error
        if (res.message !== undefined && res.message.match(/^ERR/))
            self._queue.shift()(res, undefined);
        else
            self._queue.shift()(undefined, res);                       
    });

}

// sends command to redis
Client.prototype.send = function() {

    var self = this;
    
    if (arguments.length === 2) { // send(command, callback)
    
        // send command
        self._client.write(arguments[0]);
        
        // push callback into the queue
        self._queue.push(arguments[1]);  
            
    } else { // send(command, args, callback)
        
        // send command and args
        self._client.write(arguments[0], arguments[1]);
    
        // push callback into the queue
        self._queue.push(arguments[2]);              
    }
}

var redisev = (function() {
    return {
        create: function() {
            return new Client();
        }
    };
})();

module.exports = redisev;
