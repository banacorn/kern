var net     = require('net'),
    redis   = require('redis'),
    emitter = new (require('events').EventEmitter)();
    
    
emitter.emitOnce = {};





var redisev = (function() {

    var self = this,
        client = {};

    


    //////////////////
    // functions   
    //////////////////


    var newClient = function(id) {   
        return {
            connect: function(port, host, auth) {                     
                var self = this;
                // localhost
                if(host === undefined)
                    host = 'localhost';
                
                // check connection
                checkConnection(port, host, function() {
                
                    client[id] = redis.createClient(port, host);
                    client[id].auth(auth);
                    
                    // ready
                    client[id].on('ready', function(res) {
                        self.emitonce('ready', res);
                    });
                    
                    // error
                    client[id].on('error', function(err) {
                        // auth or error
                        if(err.match(/ERR operation not permitted/)) 
                            self.emit('auth', err);
                        else
                            self.emit('error', err);
                    });
                }); 
            },
            command: function(command, args) {
            },
            on: function(event, callback) {
                emitter.on(event + ':' + id, callback);
            },
            once: function(event, callback) {
                emitter.once(event + ':' + id, callback);
            },
            emitonce: function(event, data) {
                if(emitter.emitOnce[event + ':' + id] === undefined) {
                    emitter.emitOnce[event + ':' + id] = 'emitted';
                    emitter.emit(event + ':' + id, data);
                }
            },
            emit: function(event, data) {
                emitter.emit(event + ':' + id, data);
            }
        };
    };
    
    var checkConnection = function(port, host, callback) {
        var socket = new net.Socket();
        
        socket.setTimeout(1000);
        socket.connect(port, host);
        
        socket.on('connect', function() {
            socket.setTimeout(0);
            socket.destroy();
            callback();
        });
        socket.on('error', function(err) {
            emit('error', err);
            socket.destroy();
        });
        socket.on('timeout', function() {
            emit('error', 'ETIMEDOUT');
            socket.destroy();
        });
        
    }
        
    var on = function(event, callback) {
            emitter.on(event, callback);
    };
    var emit = function(event, data) {
            emitter.emit(event, data);
    };
    
    return {
        debugMode: 0,
        register: function(id) {
        
            // no id as empty id does
            if(id === undefined)
                id = '';
                
            if(self.debugMode > 0)
                self.emit('new client');
                
            client[id] = newClient(id);
            return client[id];
        },
        on: function(event, callback) {
            if(self.debugMode > 1)
                self.emit('new listener');
            emitter.on(event, callback);
        },
        emit: function(event, data) {
            if(self.debugMode > 1)
                self.emit('new emitter');
            emitter.emit(event, data);
        }
    };
})();

module.exports = redisev;
