# redisev - event wrapper upon [node_redis](https://github.com/mranney/node_redis)
* simple
* evented
* mild error handling

======================================
# Install
```
npm install redisev
```

# Usage
## redisev
    var redisev = require('redisev');
## client
register *one* client:
    var client = redisev.register();
register *more than one* client:
    var alice = redisev.register('alice');
    var bob = redisev.register('bob');
