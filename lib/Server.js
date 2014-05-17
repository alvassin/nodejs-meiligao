var EventEmitter = require('events').EventEmitter,
    extend       = require('extend'),
    net          = require('net'),
    Tracker      = require(__dirname + '/Tracker'),
    util         = require("util");

/**
 * Constructor   
 * @param {object} options
 */    
var Server = module.exports = function(options) {
    
    /**
     * Configuration
     * @var {object}
     */
    this.config = extend({timeout: 120000}, options);

    /**
     * Connected trackers
     * @var array
     */
    this.trackers = [];
    
    /**
     * Server, listening for connections
     * @var {net.Server}
     */
    this.tcpServer;

    // Link to current object instance
    var server = this;
    
    // Configure net.Server
    this.tcpServer = net.createServer(function(connection) {
    
        var tracker = new Tracker(connection, {timeout: server.config.timeout});
        
        tracker.on('login', function(){ server.emit('login', tracker); });
        tracker.on('heartbeat', function(){ server.emit('heartbeat', tracker); });
        
        tracker.on('message', function(message){ server.emit('message', message, tracker); });
        
        tracker.on('packet.in', function(packet){ server.emit('packet.in', packet, tracker); });
        tracker.on('packet.out', function(packet){ server.emit('packet.out', packet, tracker); });
        
        tracker.on('error', function(err, data){ server.emit('error', err, data); });
        tracker.on('disconnect', function() {
            for (var i in server.trackers) {
                if (server.trackers[i] == tracker) {
                    server.emit('disconnect', tracker);
                    delete server.trackers[i];
                }
            }
        });
        
        server.trackers.push(tracker);
        server.emit('connect', tracker);
    });
}
util.inherits(Server, EventEmitter);

/**
 * Binds to the specific port
 * @param {number} port
 * @param {function} callback
 */
Server.prototype.listen = function(port, callback) {
    this.tcpServer.listen(port, callback);
    return this;
};