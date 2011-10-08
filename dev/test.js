var rediz = require('../rediz');
var Queue = require('../lib/queue').Queue;

var client = rediz.create();
client.connect(9838, 'filefish.redistogo.com', '0565140a7c5be78197e3c9f998083199');


client
<<<<<<< HEAD
    .send('GET', 'A:id')
    .collect();
    
client
    .defer()
    .send('GET', 'A:#{0}')
    .collect(function (res, basket) {    
        console.log(res);
    })
    .disconnect();
    
=======
    .send('flushdb')
    .send('set', 'cat:id', 0)
    .send('get', 'cat:id')
    .collect(function (res, basket) {
        basket.id = res[2];
    })
    .defer()
    .send('set', 'cat:#{id}', 'haha')
    .send('keys', '*')
    .collect(function (res, basket) {
        console.log(res);
        console.log(basket);
    })
    .disconnect();
    
    
>>>>>>> dev

