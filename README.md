Server
------
### Events
* `connect` - Tracker connected
* `heartbeat` - Tracker sent heartbeat packet
* `report` - Tracker sent report
* `alarm` - Tracker sent alarm
* `message.in` - Tracker sent message
* `message.out` - Message was sent to tracker
* `error` - Error happened
* `disconnect` - Tracker has disconnected

### Methods
* `Server(options)` - Constructor
* `listen(port, callback)` - Binds server to the specified port

Tracker
-------
### Events
* `login` - tracker login request was confirmed
* `heartbeat` - tracker sent heartbeat packet
* `error` - error happened
* `message.in` - tracker sent message (useful for debugging)
* `message.out` - message was sent to tracker (useful for debugging)
* `report` - tracker sent location report by time or distance interval
* `alarm` - tracker sent alarm 
* `timeout` - tracker has reached timeout
* `disconnect` - tracker disconnected

### Methods
* `Tracker(connection, options)` - Constructor
* `request(message, callback)` - Puts given message in a queue
* `send(message)` - Sends given message immediately
* `getCurrentCoords(callback)` - Returns current tracker location
* `getSnImei(callback)` - Returns tracker serial number & imei
* `resetConfiguratimeon(callback)` - Resets tracker configuration, except password, ip, port, apn, tracker id and report time interval
* `clearMileage(callback)` - Clears mileage
* `setHeartbeatInterval(minutes, callback)` - Sets heartbeat interval
* `getAuthorizedPhone(button, callback)` - Returns authorized phone
* `setAuthorizedPhone(smsPhone, callPhone, callback)` - Sets authorized phone
* `setReportDistanceInterval(meters, callback)` - Sets report distance interval
* `getReportTimeInterval(callback)` - Returns report time interval
* `setReportTimeInterval(interval, callback)` - Sets report time interval
* `setMemoryReportInterval(seconds, callback)` - Sets memory report time interval
* `getMemoryReports(callback)` - Returns all reports, stored in memory
* `clearMemoryReports(callback)` - Clears memory reports
* `setSpeedingAlarm(speed, callback)` - Sets speeding alarm
* `setMovementAlarm(radius, callback)` - Sets movement alarm
* `setGeofenceAlarm(latitude, longitude, radius, callback)` - Sets geofence alarm

Message
-------
* `Message(options)` - Constructor
* `createFromBuffer(buffer, mode)` - Creates new message from binary data
* `getCommandNameByCode(code)` - Returns command name by code
* `resolveCommand(code)` - Resolves response command code for specified command
* `parseCommandResult(code, buffer)` - Parses command execution result
* `toString()` - Returns readable message information
* `toBuffer()` - Returns encoded message as Buffer



