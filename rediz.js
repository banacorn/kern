var Emitter = require('events').EventEmitter,
    util = require('util'),
    _ = require('underscore'),
    Redis = require('./lib/redis').Redis,
    Queue = require('./lib/queue').Queue,
    Collector = require('./lib/collector').Collector;

// the missing _.init()
_.init = function(array, n, guard) {
    return (n != null) && !guard ? Array.prototype.slice.call(array, 0, n) : Array.prototype.slice.call(array, 0, -1);
};




// ********************
//     Constructor
// ********************

var Client = function () {
    var self            = this;
    this._emitter       = new Emitter();                // event emitter
    this._redis         = new Redis(this._emitter);     // redis socket
    this._queue         = new Queue();                  // message queue
    this._collector     = new Collector();              // collector
    
    this._collector.newTask();
    
    this._emitter.on('connect', function () {
        console.log('connected');
    });
    this._emitter.on('error', function (err) {
        console.log(err);
    });
    
    this._emitter.on('redis reply', function (res) {
        // Dequeue
        var callback = self._queue.shift();
        
        // Redis Error
        if (res instanceof Error)
            callback(res, undefined);
        else
            callback(undefined, res);
    });
};


Client.prototype.connect = function (port, host, auth) {    
    this._redis.createConnection(
        port || 6379,
        host || '127.0.0.1'
    );
};

Client.prototype.send = function () {
                            
    var hasCallback = _(arguments).chain()
                        .last()
                        .isFunction()
                        .value(),
        args,
        callback;
        
    if (hasCallback) {
    
        var init = _.init(arguments);   //ugly  
        
        args = _(init).map(function (elem) {
            return elem.toString();
        });
        callback = _(arguments).last();
        
        this._queue.push(callback);
        
    } else {
    
        args = _(arguments).map(function (elem) {
            return elem.toString();
        });
        
        this._queue.push(this._collector.assign());
        
    }
    
    this._redis.write.apply(null, args);
    
    return this;
}

Client.prototype.collect = function (callback) {
    this._collector.done(callback);    
    this._collector.newTask();
    return this;
}


// ********************
//     Exports
// ********************

module.exports.create = function () {
    return new Client();
}

module.exports.Client = Client;
