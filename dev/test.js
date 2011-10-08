var rediz = require('../rediz');
var Queue = require('../lib/queue').Queue;

var client = rediz.create();
client.connect(9838, 'filefish.redistogo.com', '0565140a7c5be78197e3c9f998083199');


client
    .send('GET', 'A:id')
    .collect();
    
client
    .defer()
    .send('GET', 'A:#{0}')
    .collect(function (res, basket) {    
        console.log(res);
    })
    .disconnect();
    

