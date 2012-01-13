# Kern
Minimalistic Node.js client for Redis

# Usage

    var kern = require('kern').createConnection();
    
    kern.on('error', function (error) {
        console.log(error);    
    });
    
    kern.send('AUTH', '0565140a7c5be78197e3c9f998083199');
    
    kern.send('GET', 'A');
    
    kern.end();
