# Kern
Minimalistic Node.js client for Redis

# Install

    npm install kern

# Usage

    var kern = require('kern').createConnection();
    
    kern.on('error', function (error) {
        console.log(error);    
    });
    
    kern.send('AUTH', '0565140a7c5be78197e3c9f998083199');
    
    kern.send('GET', 'A');
    
    kern.end();
    
# Methods

## createConnection([port='6379'], [host='127.0.0.1'])

    var kern = require('kern').createConnection();
    
This is same as above.

    var kern = require('kern');
    var kern = kern.createConnection();
    
## send(command, arg0, arg1, ..., [callback])

    kern.send('SET', 'foo', 'bar');
    kern.send('GET', 'foo', function (reply) {
        console.log(reply);
    });
    
You may want to authenticate to the server before sending any other commands.
    
    kern.send('AUTH', '0565140a7c5be78197e3c9f998083199');
    
## end()

Close the connection.

    kern.end();
    
# Events

## "error"    

It is strongly suggested to listen to the event `"error"` right after `createConnection` or your program will die if there's any error being thrown.
    
    kern.on('error', function (error) {
        console.log(error);
    })
