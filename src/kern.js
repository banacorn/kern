var hiredis = require('hiredis'),
    Queue   = require('../lib/queue').Queue;


var Kern = function () {
    this._socket;
    this._queue = new Queue;
}

Kern.prototype.connect = function (port, host) {

    var that = this;
    
    console.log(this._socket)
    
    this._socket = hiredis.createConnection(
        port || 6379,
        host || '127.0.0.1'
    );
    
    /*
    **  setTimeout
    */
    
    this._socket.setTimeout(5000, function () {
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
    
        
    
        // shift the callback queue
        var callback = that._queue.shift();
        
        if (typeof callback === 'function') {
        
            if (/^Error/.test(data)) {  
                that._socket.emit('reply error', data.toString());
                callback(data.toString(), null)
            } else {
                callback(null, data.toString())
            }
                
        }
            
        if (that._queue.length === 0)
            that._socket.emit('idle');
    });
    
    
    
    this.on = function (ev, cb) {
        that._socket.on(ev, cb);
    };    
    
    this.end = function () {
        that._socket.end();
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


module.exports.Kern = Kern;
