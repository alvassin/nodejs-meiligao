var EventEmitter = require('events').EventEmitter,
    extend       = require('extend'),
    Message      = require(__dirname + '/Message'),
    Queue        = require(__dirname + '/Queue'),
    util         = require("util");
    
/**
 * Available statuses
 */
Tracker.STATUS_NOT_LOGGED_IN = 0;
Tracker.STATUS_WAITING = 1;
Tracker.STATUS_WORKING = 2;    

/**
 * Constructor
 * @param {net.Socket} connection
 * @param {object} options
 */
function Tracker(connection, options) {

    /**
     * Configuration
     * @var {object}
     */
    this.config = extend({timeout: 120000}, options);
    
    /**
     * Unique tracker identifier
     * @var {string}
     */
    this.trackerId = null;
    
    /**
     * Status
     * @var {number}
     */
    this.status = Tracker.STATUS_NOT_LOGGED_IN;
    
    /**
     * Tracker connection
     * @var {net.Socket}
     */
    this.connection = connection;
    
    /**
     * Requests queue
     * @var {array}
     */
    this.queue = new Queue();
    
    // Link to current object instance
    var tracker = this;
    
    // Handle data
    this.connection.on('data', function(buffer) {
        
        // Handle heartbeat messages (0x00)
        if (buffer.toString('hex') === '00') {
            tracker.emit('heartbeat');
            return;
        }
        
        // Parse message
        var message = Message.createFromBuffer(buffer);
        if (!message) {
            tracker.emit('error', new Error('Error parsing message'), buffer);
            return;
        }
        
        // Emit incoming message event
        tracker.emit('packet.in', message);
        
        // Assign trackerId, if unset
        if (!tracker.trackerId && message.trackerId) {
            tracker.trackerId = message.trackerId;
        }
        
        // Handle login command
        if (message.command === Message.commands.LOGIN) {
            tracker.send(new Message({
                command : Message.commands.CONFIRM_LOGIN,
                data    : '01',
                mode    : Message.MODE_RAW_DATA
            }));
            
            // Process queue
            if (!tracker.queue.isEmpty()) {
                tracker.send(tracker.queue.getCurrent().message);
                tracker.status = Tracker.STATUS_WORKING;
            } else {
                tracker.status = Tracker.STATUS_WAITING;
            }
            tracker.emit('login');
        }
        
        // Handle pending requests
        if (tracker.queue.getCurrent().responseCommand === message.command) {
            tracker.queue.resolveCurrent(message);
            tracker.status = Tracker.STATUS_WAITING;
            
            // Process queue
            if (!tracker.queue.isEmpty()) {
                tracker.send(tracker.queue.getCurrent().message);
                tracker.status = Tracker.STATUS_WORKING;
            }
        }
        
        // Handle reports & alarms
        if (message.command === Message.commands.REPORT) {
            tracker.emit('message', {
                type : Message.types.REPORT_BY_TIME,
                data : Message.parseCommandResult(Message.commands.REPORT, new Buffer(message.data)),
            });
        } 
        
        if (message.command === Message.commands.ALARM) {
            tracker.emit('message', Message.parseCommandResult(Message.commands.ALARM, new Buffer(message.data)));
        }
    });
     
    // Handle disconnects
    this.connection.on('close', function() {
        tracker.emit('disconnect');
    });   
    
    // Set connection timeout
    this.connection.setTimeout(this.config.timeout, function() {
        tracker.emit('timeout');
        tracker.connection.destroy();
    });
}

util.inherits(Tracker, EventEmitter);
module.exports = Tracker;

/**
 * Sends specified message to connected device,
 * sets message.trackerId, if missing
 * @param {Message} message
 */
Tracker.prototype.send = function(message) {

    // Set trackerId, if missing
    if (!message.trackerId) {
        message.trackerId = this.trackerId;
    }
    
    // Emit outgoing message event
    this.emit('packet.out', message);
    
    // Send message to device
    this.connection.write(message.toBuffer());
}

/**
 * Sends specified message & calls callback, when receives response,
 * sets message.trackerId, if missing.
 * Allows only 1 command to be in queue at one time
 * @param {number} command
 * @param {mixed} data
 * @param {function} callback
 * @return {boolean}
 */
Tracker.prototype.request = function(message, callback) {

    // Device must be authorized for performing requests
    if (!this.trackerId) {
        callback(new Error('Tracker id unknown'));
        return false;
    }
    
    // Set trackerId, if missing
    if (!message.trackerId) {
        message.trackerId = this.trackerId;
    }
    
    // Add to the end of queue
    this.queue.push(message, callback);
    
    // If currently nothing is being executed - process request
    if (this.status === Tracker.STATUS_WAITING) {
        this.status = Tracker.STATUS_WORKING;
        this.send(this.queue.getCurrent().message);
    }
    
    return true;
};
