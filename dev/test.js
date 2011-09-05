var redisev = require('../redisev');
var client = redisev.create();
// client.connect(9838, 'filefish.redistogo.com', '0565140a7c5be78197e3c9f998083199');

client.connect();


client
    .ready(function () {
    }).reply(function (err, res) {
        console.log(err);
        console.log(res);
    
        if (err !== undefined)
            console.log('RE: ' + err);
        else
            console.log(res);
    }).error(function (err) {
        console.log(err);
    });
