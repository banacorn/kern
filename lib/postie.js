var Queue = require('./queue').Queue;
    
// ********************
//     Postie
// ********************

function Postie (emitter) {
    this._steps = new Queue();
}

// ********************
//     Step
// ********************

function Step (emitter) {
    this._collectors = new Queue();
}

module.exports.Postie = Postie;
