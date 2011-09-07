var Emitter = require('events').EventEmitter,
    util = require('util'),
    Redis = require('./lib/redis').Redis,
    Queue = require('./lib/queue').Queue




// ********************
//     Constructor
// ********************

var Client = function () {

    var self = this;

    // event emitter
    this._emitter = new Emitter();

    // redis socket    
    this._redis = new Redis(this._emitter);
    
    // queue for reply callbacks    
    this._queue = new Queue();
    
    // basket for storing replies    
    this._basket = [];
    
    // reply from redis
    this._emitter.on('redis reply', function (res) {
    
        // dequeue
        var fn = self._queue.shift();
        
        // OK or ERROR
        self.judge(res, function (res) { // OK
         
            // emit reply
            self._emitter.emit('reply', undefined, res);
                
            // call the callback if it was attached, else dump it
            if (typeof fn === 'function')
                fn(undefined, res);
            
        }, function (res) { // error
        
            // emit reply
            self._emitter.emit('reply', res, undefined);  
                 
            // call the callback if it was attached, else dump it
            if (typeof fn === 'function')
                fn(res, undefined);
            
        });
    });
}




// ********************
//     Methods
// ********************

Client.prototype._authenticate = function(auth) {

    var self = this;

    // authenticate to the server
    self.send('AUTH', auth || '', function(err, res) {
        self.judge(res, function () {
            self._emitter.emit('ready');        
        }, function () {
            self._emitter.emit('error', err);        
        });
    });
};


Client.prototype.connect = function(port, host, auth) {  
  
    var self = this;
    
    self._redis.createConnection(
        port || 6379,
        host || '127.0.0.1'
    );
    
    self._authenticate(auth)

    return this;
};

Client.prototype.disconnect = function () {
    this.send('QUIT');
    this._redis.disconnect();
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
        self._queue.push(0);
    
    }
    
    // write socket
    self._redis.write.apply(self._client, args);    

    return this;
};

Client.prototype.collect = function(callback) {
    if (typeof callback === 'function') {
        callback();
    } else if (typeof callback === 'string') {
    
    }

    return this;
};

Client.prototype.judge = function(res, ok, err) {
    if (res.message !== undefined && res.message.match(/^ERR/))
        err(res);
    else
        ok(res);

    return this;
};

Client.prototype.collect = function(callback) {
    var self = this,
        stuffs = self._basket;
        
    // clear the basket
    self._basket = [];
    
    if (typeof callback === 'function') {
        callback(stuffs);
    } else if (typeof callback === 'string') {
        self._emitter.emit(callback, stuffs);
    }

    return this;
};

Client.prototype.on = function(event, callback) {
    var self = this;
    self._emitter.on(event, callback);
};


Client.prototype.slave = function() {
    return new Slave(this);
}

var Slave = function (master) {   
    
    // this and that
    this._master = master
    
    // properties for the inherited methods
    this._queue = master._queue;
    this._emitter = master._emitter;
    this._redis = master._redis;
    this._send = master.send;
    
    // number of tasks left to be done
    this.tasks = 0;
    
    // basket for collected goods
    this.basket = [];
    
    // call this when all of the tasks have been done
    this._done = function () {};
};

// inherits all of the methods from the master
util.inherits(Slave, Client);

// takeover by slave
Slave.prototype.send = function () { 
    var self = this;
    
    // arguments
    var length = arguments.length,
        args = [];        
    for (var i = 0; i < length; i++)
        args[i] = arguments[i];
    
    // callback for the queue
    var callback = function (err, res) {
    
        // collect everything whether error or not
        if(err)
            self.basket.push(err)
        else
            self.basket.push(res)
            
        // task done!!
        self.tasks--;
        
        // if all tasks are done
        if (self.tasks === 0) { 
        
            // call the final callback, with basket of goods
            self._done(self.basket);
            
            // empty the basket
            self.basket = [];
        }
    };
    
    // attach the callbacks and replace the old one if needed
    if (typeof arguments[length - 1] === 'function')
        args[length - 1] = callback;
    else
        args[length] = callback;        
        
    // new task!
    self.tasks++;
    
    // send!
    self._send.apply(self._master, args);
    
    return this;
};

Slave.prototype.collect = function (callback) {
    
    // attach the final callback
    this._done = callback;
    
    return this;
}


// ********************
//   Helper Functions
// ********************


Client.prototype.ready = function (callback) {
    var self = this;
    self._emitter.on('ready', callback);    

    return this;
};

Client.prototype.error = function (callback) {
    var self = this;
    self._emitter.on('error', callback);    

    return this;
};


Client.prototype.reply = function (callback) {
    var self = this;
    self._emitter.on('reply', callback);

    return this;
};


// ********************
//     Exports
// ********************

module.exports.create = function () {
    return new Client();
}
module.exports.Client = Client;
