var net     = require('net'),
    redis   = require('redis'),
    emitter = new (require('events').EventEmitter)();





var redisev = (function() {

    var self = this,
        master,
        clients = {};




    //////////////////
    // functions   
    //////////////////

    // register a client
    var register = function(id) {
        clients[id] = 'registered'
    }

    var newClient = function(id) {
        var id = id;
            
        register(id);
            
        return {
                    
        };
    }
    
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
    
    var connect = function(port, host, auth) {
        
            // localhost
            if(host === undefined)
                host = 'localhost';
            
            // check connection
            checkConnection(port, host, function() {
            
                master = redis.createClient(port, host);
                master.auth(auth);
                
                // ready
                master.on('ready', function(res) {
                    emit('ready', res);
                });
                
                // error
                master.on('error', function(err) {
                
                    // auth or error
                    if(err.match(/ERR operation not permitted/)) 
                        emit('auth', err);
                    else
                        emit('error', err);
                });
            });
            
            
    };
        
    var on = function(event, callback) {
            emitter.on(event, callback);
    };
    var emit = function(event) {
            emitter.emit(event, data);
    };
    
    return {
        connect: connect,
        on: on,
        emit: emit
    };
})();

module.exports = redisev;
