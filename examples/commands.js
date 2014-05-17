var meiligao = require('../index.js');

// Set up server
var server = new meiligao.Server().listen(20180, function(error) {
    if (error) throw error;
    console.log('gps server is listening');
});

// All commands will be executed one by one
server.on('connect', function(tracker) { 

    // tracker.requestReport(function(err, data) {
        // if (err) {
            // console.log('REQUEST REPORT ERROR: ', err);
        // } else {
            // console.log('REQUEST REPORT: ', data);
        // }
    // });
    
    // tracker.getSnImei(function(err, data) {
        // if (err) {
            // console.log('GET SN IMEI ERROR: ', err);
        // } else {
            // console.log('GET SN IMEI: ', data);
        // }
    // });
    
    // tracker.resetConfiguration(function(err, result){
        // if (err) {
            // console.log('RESET CONFIGURATION ERROR: ', err);
        // } else {
            // console.log('RESET CONFIGURATION: ', result);
        // }
    // });    
    
    // tracker.setHeartbeatInterval(1, function(err, result){
        // if (err) {
            // console.log('SET HEARTBEAT INTERVAL ERROR: ', err);
        // } else {
            // console.log('SET HEARTBEAT INTERVAL: ', result);
        // }
    // });    
    
    // tracker.clearMileage(function(err, result){
        // if (err) {
            // console.log('CLEAR MILEAGE ERROR: ', err);
        // } else {
            // console.log('CLEAR MILEAGE: ', result);
        // }
    // });    
    
    // tracker.getMemoryReports(function(err, reports){
        // if (err) {
            // console.log('GET MEMORY REPORTS ERROR: ', err);
        // } else {
            // console.log('GET MEMORY REPORTS: ', reports);
        // }
    // });        
    
    // tracker.setMemoryReportInterval(1, function(err, reports){
        // if (err) {
            // console.log('SET MEMORY REPORT INTERVAL ERROR: ', err);
        // } else {
            // console.log('SET MEMORY REPORT INTERVAL: ', reports);
        // }
    // });    
    
    // tracker.clearMemoryReports(function(err, reports){
        // if (err) {
            // console.log('CLEAR MEMORY REPORTS ERROR: ', err);
        // } else {
            // console.log('CLEAR MEMORY REPORTS: ', reports);
        // }
    // });
        
    // tracker.setAuthorizedPhones(79295114443, 79295114443, function(err, reports){
        // if (err) {
            // console.log('SET AUTHORIZED PHONE ERROR: ', err);
        // } else {
            // console.log('SET AUTHORIZED PHONE: ', reports);
        // }
    // });    
    
    // tracker.getAuthorizedPhones(function(err, phones){
        // if (err) {
            // console.log('GET AUTHORIZED PHONES ERROR: ', err);
        // } else {
            // console.log('GET AUTHORIZED PHONES: ', phones);
        // }
    // });
    
    
    tracker.setReportTimeInterval(2, function(err, interval){
        if (err) {
            console.log('SET REPORT TIME INTERVAL ERROR: ', err);
        } else {
            console.log('SET REPORT TIME INTERVAL: ', interval);
        }
    });        
    
    tracker.setReportDistanceInterval(300, function(err, interval){
        if (err) {
            console.log('SET REPORT DISTANCE INTERVAL ERROR: ', err);
        } else {
            console.log('SET REPORT DISTANCE INTERVAL: ', interval);
        }
    });    
    
    tracker.getReportTimeInterval(function(err, interval){
        if (err) {
            console.log('GET REPORT TIME INTERVAL ERROR: ', err);
        } else {
            console.log('GET REPORT TIME INTERVAL: ', interval);
        }
    });
    
});

// Handle errors
server.on('login', function(tracker){ console.log(tracker.queue); });

// Handle errors
server.on('error', function(error, tracker){ console.log('error happened', error); });

// Handle disconnects
server.on('disconnect', function(tracker){ console.log('tracker disconnected'); });