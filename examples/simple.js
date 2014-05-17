var meiligao = require('../index.js');

var server = new meiligao.Server().listen(20180, function(error) {
    if (error) {
        throw error;
    }
    console.log('gps server is listening');
});

// Tracker connect
server.on('connect', function(tracker) { console.log('connect'); });

// Tracker requested login (and it was confirmed)
server.on('login', function(tracker) { console.log('login'); });

// Heartbeat packets
server.on('heartbeat', function(tracker) { console.log('heartbeat'); });

// Most useful thing
server.on('message', function(message, tracker) { console.log('message', meiligao.Message.getMessageTypeByCode(message.type), message); })

// Useful for debugging
server.on('packet.in', function(packet, tracker){ console.log('packet.in', packet.toString()); });
server.on('packet.out', function(packet, tracker){ console.log('packet.out', packet.toString()); });

// Handle errors
server.on('error', function(error, tracker){ console.log('error', error); });

// Handle disconnects
server.on('disconnect', function(tracker){ console.log('disconnect'); });