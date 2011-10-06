var redisev = require('../redisev');
var redis = require('redis');
var rediz = require('../rediz');

// rediz


var z = function (times) {
    var client = rediz.create();
    client.connect();
    client.on('connect', function () {
        console.time('SET');
        for (var i = 0; i < times; i++) {
            client.send('SET', 'foo:', i, function(){});
        }
        
        client.send('PING', function () {
            console.timeEnd('SET');
            client.disconnect();
        });
    });
}
// redisev
var v = function (times) {
    var client = redisev.create();
    client.connect();
    client.on('connect', function () {
        console.time('SET');
        for (var i = 0; i < times; i++) {
            client.send('SET', 'foo:', i);
        }
        
        client.send('PING', function () {
            console.timeEnd('SET');
            client.disconnect();
        });
    });
}


var s = function (times) {
    var client = redis.createClient();

    client.on('ready', function () {
        console.time('SET');
        for (var i = 0; i < times; i++) {
            client.set('foo:', i);
        }
        
        client.ping(function () {
            console.timeEnd('SET');
            client.end();
        });
    });
}


z(1);
