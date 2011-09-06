var redisev = require('../redisev');

var client = redisev.create();

client.connect();

client.ready(function () {
    console.time('SET');
    for (var i = 0; i < 100000; i++) {
        client.send('SET', 'foo:' + i, i);
    }
    
    client.send('PING', function () {
        console.timeEnd('SET');
        client.disconnect();
    });
});
