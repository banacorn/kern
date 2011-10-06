var Queue = require('./queue').Queue;
    
// ********************
//     Constructor
// ********************

function Collector (client) {
    var self = this;
    this._client = client;
    this._task = new Queue();
    this.basket = {}; 
    
    this.newTask();
}

// ********************
//     Methods
// ********************


Collector.prototype.newTask = function () {    
    this._task.push({
        deferred: false,
        response: [],
        left: 0,
        callback: undefined,
        next: undefined
    });
    
    var lastTask = this._task.get(this._task.length - 2);
    var currentTask = this._task.get(this._task.length - 1);
    if (lastTask)
        lastTask.next = currentTask;
};

Collector.prototype.defer = function (argument) {
    var currentTask = this._task.get(this._task.length - 1);
    
    if (currentTask.deferred === false) { // first time deferred
        currentTask.deferred = true;
        currentTask.commands = [];
        currentTask.commands.push(argument);
    } else {
        currentTask.commands.push(argument);
    }
        
};

Collector.prototype.callback = function (callback) {
    // attach callback to the current task
    this._task.get(this._task.length - 1).callback = callback;
};


Collector.prototype.assign = function (currentTask) {
    var self            = this,
        currentTask     = currentTask || this._task.get(this._task.length - 1),
        sender          = this._client._send;
    
    // more task left
    currentTask.left++;

    // the callback to be returned
    var callback = function (err, res) {
        // gather err & res
        if (err)
            currentTask.response.push(err);
        else
            currentTask.response.push(res);
    
        // less task left
        currentTask.left--;
    
        // done!
        if (currentTask.left === 0) {
            currentTask.callback(currentTask.response, self.basket);
            
            // check the next task if it's deferred and need to be invoked
            if (currentTask.next.deferred) {
                for (var i = 0, len = currentTask.next.commands.length; i < len; i++) {
                    // interpolation
                    for (var j = 0, lenn = currentTask.next.commands[i].length; j < lenn; j++)
                        currentTask.next.commands[i][j] = self._interpolate(currentTask.next.commands[i][j], self.basket);
                    console.log(currentTask.next.commands[i]);
                    sender.call(self._client, currentTask.next.commands[i], self.assign(currentTask.next)); 
                }
            }
            
            delete currentTask;
        }
    };
    return callback;
};

Collector.prototype._interpolate = function (string, basket) {
    var regex = /#\{([^\}]+)\}/g, match;
    while (match = regex.exec(string)) {
        // if it matches the items in the 'basket'
        var item = basket[match[1]];
        if (item !== undefined)
            string = string.replace(match[0], item);
        else
            string = string.replace(match[0], '');
    }
    return string;
};


module.exports.Collector = Collector;
