# redisev

event wrapper upon [node_redis](https://github.com/mranney/node_redis)

* simple
* evented
* mild error handling


## Install

    npm install redisev
    
    
## Usage

    var redisev = require('redisev');
    
register **one** client:

    var god = redisev.register();
    
register **more than one** client:

    var alice = redisev.register('alice');
    var bob = redisev.register('bob');              
              
## Methods
    
### redisev.register([id])

give birth to a client

* id : optional, unique id for a client

----

### redisev.kill(id)

kill a client

* id : id of the client, will `disconnect()` before getting killed

----


### client.connect(port, [host], [auth])

connect to a redis server

* port : yes, port
* host : default as `localhost`
* auth : default as empty, if no authenfication needed

----

    
### client.disconnect()

disconnect from the current connection

----


### client.command(command, args, [identifier])

send command to redis
same as `emit('command', { command: command, args: args, identifier: identifier})`

* command: `GET`, `SET` ... etc
* args: array of arguments
* identifier: tag a identifier onto the emitting event, works like `command:id:identifier` under the hood

----

## Events
* **on** : listens all the time
* **once** : listens only for the first once
* **emit** : emits everytime
* **emitonce** : emits only the first time


    
