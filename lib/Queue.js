var Message = require(__dirname + '/Message');

/**
 * Constructor
 */
var Queue = module.exports = function() {

  /**
   * Current request
   * @var {object}
   */
  this.current = null;

  /**
   * Pending elements
   */
  this.pending = [];
}

/**
 * Adds request to the end of queue,
 * callback should update request execution status itself
 * @param {Message} message
 * @param {function} callback
 */
Queue.prototype.push = function(message, callback) {
  this.pending.push({
    responseCommand: Message.resolveCommand(message.command),
    message: message,
    callback: callback,
  });
}

/**
 * Returns current request
 * @return {object|boolean}
 */
Queue.prototype.getCurrent = function() {
  if (!this.current) {
    if (this.pending.length < 1) {
      return false;
    }
    this.current = this.pending.shift();
  }
  return this.current;
}

/** 
 * Checks, if there are any pending requests
 * @return {boolean}
 */
Queue.prototype.isEmpty = function() {
  return this.pending.length === 0;
}

/**
 * Resolves current request and removes it from queue
 * @param {Message} message
 */
Queue.prototype.resolveCurrent = function(message) {
  this.current.callback(null, message);
  this.current = null;
}

