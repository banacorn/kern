var redisev = require('../redisev');

var client = redisev.create();
client.connect(9838, 'filefish.redistogo.com', '0565140a7c5be78197e3c9f998083199');

//client.connect();




client
    .ready(function () {
        console.log('READY!');
    })
    .reply(function (err, res) {
        // console.log(res);
    })
    .error(function (err) {
        console.log(err);
    });
        
      
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
    });

    

