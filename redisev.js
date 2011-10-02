var Emitter = require('events').EventEmitter,
    util = require('util'),
    _ = require('underscore'),
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

Client.prototype.authenticate = function(auth) {

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
    
    if (auth !== undefined)
        self.authenticate(auth);

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
//   Slave & Job
// ********************


var Job = function () {
    // basket for collected goods
    this.basket = [];
    // number of tasks left to be done
    this.task = 0;
    // call this when all of the tasks have been done
    this.collector;
}

Job.prototype.assign = function (master) {
    var self = this;
    
    // new task assigned
    self.task++;
    
    // return this function as a callback
    return function (err, res) {
        // collect everything whether error or not
        if(err)
            self.basket.push(err)
        else
            self.basket.push(res)
            
        // task done!!
        self.task--;
        
        // check if all tasks are done
        if (self.task === 0) { 
        
            // call the final callback, with basket of goods
            self.collector(self.basket);
            
            // empty the basket
            self.basket = [];
            
            // remove this job
            master.job.shift();
        }
      
    };
};



var Slave = function (master) {   
    
    // this and that
    this._master = master
    
    // properties for the inherited methods
    this._queue = master._queue;
    this._emitter = master._emitter;
    this._redis = master._redis;
    this._send = master.send;
    
    
    this.job = [];
    this.job.push(new Job());
};

// inherits all of the methods from the master
util.inherits(Slave, Client);

// takeover by slave
Slave.prototype.send = function () {

    var self = this,
        job = _(self.job).last(),           // current job
        args = _(arguments).toArray(),      // arguments
        hasCallback = _(args).chain()       // attach the callbacks and replace the old one if needed
            .last()
            .isFunction()
            .value();
                
    if(hasCallback)
        args[args.length - 1] = job.assign(self);
    else
        args[args.length] = job.assign(self);   
        
    // send!
    self._send.apply(self._master, args);
    
    return this;
};

Slave.prototype.collect = function (callback) {
        
    // attach the final callback
    this.job[this.job.length - 1].collector = callback;
    
    // new job!!
    this.job.push(new Job());
    
    return this;
}



// ********************
//     Exports
// ********************

module.exports.create = function () {
    return new Client();
}
module.exports.Client = Client;