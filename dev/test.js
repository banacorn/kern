var redisev = require('../rediz'),
    _ = require('underscore');

var client = redisev.create();
client.connect(9838, 'filefish.redistogo.com', '0565140a7c5be78197e3c9f998083199');

client.send('auth', '0565140a7c5be78197e3c9f998083199', function (err, res) {
    console.log(res);
});

client
    .send('set', 'a', 0)
    .send('get', 'a')
    .collect(function (res, basket) {
        console.log(res);
        console.log(basket);
        basket.push(res[1]);
    })
    .send('incr', 'a')
    .send('ping')
    .send('get', 'a')
    .collect(function (res, basket) {
        console.log(res);
        console.log(basket);
    });
/*
client
    .ready(function () {
        console.log('READY!');
    })
    .error(function (err) {
        console.log(err);
    });*/
        
      /*
client.slave()
    .send('SET', 'foo', 'bar')
    .send('PING')
    .send('PING')
    .send('GET', 'foo')
    .send('PING')
    .send('PING')
    .collect(function (res) {
        console.log(res);
    })
    .send('SET', 'foo', 'fish')
    .send('PING')
    .send('GET', 'foo')
    .send('PING')
    .collect(function (res) {
        console.log(res);
    })
    .send('GET', 'foo')
    .send('PING')
    .collect(function (res) {
        console.log(res);
    });*/
