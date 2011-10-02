var Emitter = require('events').EventEmitter,
    _ = require('underscore'),
    Queue = require('./queue').Queue;
    
// ********************
//     Constructor
// ********************

function Collector () {
    this._task = [];
    this._emitter = new Emitter();
}

// ********************
//     Methods
// ********************

Collector.prototype.newTask = function () {

    var self = this;

    this._task.push((function () {
    
        var offset = self._task.length,
            lastTask    = self._task[offset - 1],
            nextTask    = self._task[offset + 1];               
        
        
        /*
            returns a task object
            
            method 'invoke' triggered if
                1. this.invoked === false, it has not been invoked
                2. lastTask.invoked === true, the last task's callback has been invoked
            then
                1. this.invoked = true, set to invoked
                2. nextTask.invoke(), trying to trigger the next task's callback
        */
        return {
            response: [],
            callback: undefined,
            left: 0,
            invoked: false,
            invoke: function () {
                if (this.invoked === false && (lastTask === undefined || lastTask.invoked === true)) {
                    this.invoked = true;
                    if (this.callback)
                        this.callback(this.response, self.basket);
                    if (nextTask !== undefined)
                        nextTask.invoke();                    
                }
            }
        };    
    })());
    
    this.basket = [];
};

Collector.prototype.done = function (callback) {
    // attach callback to the current task
    var currentTask = this._task[this._task.length - 1];
    currentTask.callback = callback;
};


Collector.prototype.assign = function () {

    var currentTask = this._task[this._task.length - 1],
        lastTask    = this._task[this._task.length - 2],
        nextTask    = this._task[this._task.length - 2],
        self        = this;
    
    // more task left
    currentTask.left++;

    // the callback to be returned
    return function (err, res) {
        
        // gather err & res
        if (err)
            currentTask.response.push(err);
        else
            currentTask.response.push(res);
    
        // less task left
        currentTask.left--;
        
        // see if ready to invoke the collector's callback
        if (currentTask.left === 0) {
            currentTask.invoke();
        }
    }
};

module.exports.Collector = Collector;
