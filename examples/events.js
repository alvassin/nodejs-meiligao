var meiligao = require('../index.js');

// Set up server
var server = new meiligao.Server().listen(20180, function(error) {
    if (error) throw error;
    console.log('gps server is listening');
});

// Tracker connect
server.on('connect', function(tracker) { console.log('tracker has connected'); });

// Tracker requested login (and it was confirmed)
server.on('login', function(tracker) { console.log('tracker has logged in'); });

// Heartbeat packets
server.on('heartbeat', function(tracker) { console.log('tracker sent heartbeat'); });

// Most useful thing
server.on('message', function(message, tracker) {
    console.log('tracker sent message: [' + meiligao.Message.getMessageTypeByCode(message.type) + ']', message); 
});

// Useful for debugging
server.on('packet.in', function(packet, tracker){ console.log('incoming packet:', packet.toString()); });
server.on('packet.out', function(packet, tracker){ console.log('outgoing packet:', packet.toString()); });

// Handle errors
server.on('error', function(error, tracker){ console.log('error happened', error); });

// Handle disconnects
server.on('disconnect', function(tracker){ console.log('tracker disconnected'); });