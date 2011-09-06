var emitter = require('events').EventEmitter
    hiredis = require('hiredis');

// ********************
//     Constructor
// ********************

var Client = function () {

    // event emitter
    this._emitter = new emitter();

    // socket    
    this._client;
    
    // queue for reply callbacks    
    this._queue = [];
    
    // basket for storing replies    
    this._basket = [];
}

// ********************
//     Methods
// ********************

Client.prototype._authenticate = function(auth) {

    var self = this;

    // authenticate to the server
    self.send('AUTH', auth || '', function(err, res) {
        if (err === undefined)
            self._emitter.emit('ready');
        else
            self._emitter.emit('error', err);
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
    var alarm = setTimeout(function () {
        self._emitter.emit('error', 'ETIMEDOUT');
    }, 500);
    
    // on connect
    self._client.on('connect', function () {
    
        // clear our homemade setTimeout bomb
        clearTimeout(alarm);
        
        // authenticate
        self._authenticate(auth);
        
        self._emitter.emit('connect');
    });
    
    // on error
    self._client.on('error', function(err) {
        self._emitter.emit('error', err);
    });
    
    // on ready
    self._client.on('ready', function () {
        self._emitter.emit('ready');
    });
    
    // on reply, emitted by hiredis
    self._client.on('reply', function(res) {
    
        var fn = self._queue.shift();
        if (typeof fn === 'function') { // has callback
            self.judge(res, function (res) {     
                self._emitter.emit('reply', undefined, res); 
                fn(undefined, res);  
            }, function (res) {
                self._emitter.emit('reply', res, undefined);  
                fn(res, undefined);       
            });
            
        } else { // dummy
            self._basket.push(res);
        }
    
    });

};

Client.prototype.disconnect = function () {
    this.send('QUIT');
    this._client.destroy();

};

// sends command to redis
Client.prototype.send = function () {

    var self = this,
        args = [],
        length = arguments.length;
    
    if (typeof arguments[length - 1] === 'function') { // if has callback
        
        for (var i = 0; i < length - 1; i++)
            args[i] = arguments[i].toString();
            
        // push the callback into the queue
        self._queue.push(arguments[length - 1]);
    
    } else {
        
        for (var i = 0; i < length; i++)
            args[i] = arguments[i].toString();
            
        // push a dummy into the queue
        self._queue.push('');
    
    }
    
    // write socket
    self._client.write.apply(self._client, args);    
};

Client.prototype.collect = function(callback) {
    if (typeof callback === 'function') {
        callback();
    } else if (typeof callback === 'string') {
    
    }
};

Client.prototype.judge = function(res, ok, err) {
    if (res.message !== undefined && res.message.match(/^ERR/))
        err(res);
    else
        ok(res); 
};

Client.prototype.collect = function(callback) {
    if (typeof callback === 'function') {
        callback()
    } else if (typeof callback === 'string') {
    
    }
};

Client.prototype.on = function(event, callback) {
    var self = this;
    self._emitter.on(event, callback);
};


// ********************
//   Helper Functions
// ********************


Client.prototype.ready = function (callback) {
    var self = this;
    self._emitter.on('ready', callback);    
};

Client.prototype.error = function (callback) {
    var self = this;
    self._emitter.on('error', callback);    
};


// ********************
//     Exports
// ********************

var redisev = {
    create: function () {
        return new Client();
    }
};

module.exports = redisev;
