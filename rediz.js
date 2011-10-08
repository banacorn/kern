var Emitter                     = require('events').EventEmitter,
    util                        = require('util'),
    Redis                       = require('./lib/redis').Redis,
    Queue                       = require('./lib/queue').Queue,
    Collector                   = require('./lib/collector').Collector;



// ********************
//     Constructor
// ********************

var Client = function () {
    var self                    = this;
    this._emitter               = new Emitter();                // event emitter
    this._replyQueue            = new Queue();                  // reply queue
    this._redis                 = new Redis(this._emitter);     // redis socket
    this._collector             = new Collector(this);          // collector
    this._deferred              = false;
    this._reconnect             = true;
     
    this._emitter
        .on('redis reply', function (res) {
            // Dequeue
            var callback = self._replyQueue.shift();
                        
            // Redis Error
            if (res instanceof Error)
                callback(res, undefined);
            else
                callback(undefined, res);
        })
        .on('error', function (err) {
            console.log(util.inspect(err, true, 3));
        });
};

Client.prototype.on = function (event, callback) {
    this._emitter.on(event, callback);
    return this;
};

Client.prototype.connect = function (port, host, auth) {    
    
    var self = this;
    
    this.host = host;
    this.port = port;
    this.auth = auth;
    
    
    this._redis.createConnection(
        port || 6379,
        host || '127.0.0.1'
    );
    if (auth !== undefined)
        this.send('AUTH', auth, function () {});
        
    this._redis._socket
        .on('close', function () {
            if (self._reconnect) {
                console.log('trying to reconnect');
                self._redis.createConnection(this.port, this.host, this.auth);
            }
        })
        .on('error', function (err) {
            console.log(util.inspect(err, true, 3));
        });
    
    return this;
};

Client.prototype.disconnect = function () {
    var self = this;
    this._reconnect = false;
    this.defer()
        .send('QUIT')
        .collect(function () { 
            // socket disconnect after 'QUIT' sent
            self._redis.disconnect();
        });
    return this;
};

// takes a arguments object, parse it into stringified command, arguments and a callback function
Client.prototype._commandParser = function (argument) {               
    var hasCallback = (typeof argument[argument.length - 1] === 'function') ? true : false,
        args = [];
        
    
    if (hasCallback) {
    
        if (Array.isArray(argument[1])) {
            // if the 2nd argument is array
            for (var i = 0, len = argument[1].length; i < len; i++)
                args[i] = argument[1][i].toString();                
        } else {
            // arguments to array, last element ripped (callback)
            for (var i = 0, len = argument.length - 1; i < len; i++)
                args[i] = argument[i].toString();
        }
        
        
        return {
            command: args,
            callback: argument[argument.length - 1]
        };
        
             
    } else {        
    
    
        if (Array.isArray(argument[1])) {
            // if the 2nd argument is array
            for (var i = 0, len = argument[1].length; i < len; i++)
                args[i] = argument[1][i].toString();                
        } else {
            // arguments to array, last element ripped (callback)
            for (var i = 0, len = argument.length; i < len; i++)
                args[i] = argument[i].toString();
        }   
        
        
         
        return {
            command: args,
            callback: undefined
        };
    }    
};

Client.prototype.send = function () {

    // digest the arguments
    var arg = this._commandParser(arguments);
    
    if (arg.callback === undefined) { // no callback
        if (this._deferred) // deferred
            this._collector.defer(arg.command);
        else 
            this._send(arg.command, this._collector.assign());           
    
    } else { // sent it now!
    
        // reply queue
        this._send(arg.command, arg.callback);
    }   
    
    // chaining
    return this;
}

Client.prototype._send = function (command, callback) {

    // reply queue
    this._replyQueue.push(callback);
    // write to the redis socket
    this._redis.write.apply(null, command);        
    
    // chaining
    return this;
};


Client.prototype.defer = function () {
    this._deferred = true;
    return this;
};

Client.prototype.collect = function (callback) {

    this._collector.callback(callback);
    this._collector.newTask();
    this._deferred = false;
    return this;
}


// ********************
//     Exports
// ********************

module.exports.create = function () {
    return new Client();
}
