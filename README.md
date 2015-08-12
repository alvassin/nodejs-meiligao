# Quickstart
This is nodejs implementation of Meiligao protocol (GPRS communication protocol between server & [Meitrack](http://www.meitrack.net/)) GPS trackers. It supports following trackers: GT30i, GT60, VT300, VT310, VT400.

To start, install this module with command `npm install meiligao` and see [events handling](https://github.com/alvassin/nodejs-meiligao/blob/master/examples/events.js) and [command execution](https://github.com/alvassin/nodejs-meiligao/blob/master/examples/commands.js) examples.

# meiligao.Server
Designed to handle tracker connections. Accepts `timeout` option, that is automatically passed to `meiligao.Tracker` objects.

```js
var meiligao = require('meiligao');
var server = new meiligao.Server({ timeout: 120000 });
```

## Events
#### connect
Is emitted when tracker establishes connect with `meiligao.Server`. Parameters: 
* `tracker`: `meiligao.Tracker` object

#### disconnect
Is emitted when tracker closes connection. Parameters: 
* `tracker`: `meiligao.Tracker` object

## Methods
#### listen	
Bind server to the specified port.

Parameter | Type     | Description
----------|----------|------------
port      | integer  | Port number
callback  | function | User callback

```js
server.listen(20180, function(error) {
  if (error) throw error;
  console.log('gps server is listening');
});
```

# meiligao.Tracker
Designed to iteract with GPS trackers. Accepts `timeout` option, (which is passed automatically by `meiligao.Server`).

```js
var meiligao = require('meiligao');

var server = new meiligao.Server({
    timeout: 120000
}).listen(20180, function(error) {
    if (error) throw error;
    console.log('gps server is listening');
});

server.on('connect', function(tracker) { 
    console.log('tracker connected!');
});
```

## Events
#### heartbeat
Heartbeat is `0x00` message sent by tracker over time. You can configure it's interval using `tracker.setHeartbeatInterval` method.

#### error
Is emitted when it is not possible to parse tracker's message. Parameters:
* `Error`: object with error descripton
* `Buffer`: unparseable message
 
#### packet.in
Is emitted every time message is received from tracker, very useful for debugging. Parameters:
* `meiligao.Message`: message received from tracker

#### packet.out
Is emitted every time message is passed to tracker, is useful for debugging.
Parameters:
* `meiligao.Message`: message sent to tracker

#### login
Is emitted after tracker sent `0x5000` login request & successful login confirmation `0x4000` was sent back. In fact, login request can not be used for real authentication, it tells that data sent by tracker will be accepted by server. 
If you need to implement authentication, use `tracker.getSnImei` method to receive tracker's data & then `tracker.disconnect` to disconnect non-authenticated trackers.

#### message
Is emitted every time tracker sends alarm or report. Parameters:
* `Object` with following data:
  * `type`: message type (see `Message.types`)
  * `data`: parsed result
  * `raw`: raw data

#### disconnect
Is emitted after connection was closed.

#### timeout
Is emitted after connection is timed out (timeout can be configured in Tracker options).

## Methods
#### disconnect
Close tracker connection.

```js
var meiligao = require('meiligao');

var server = new meiligao.Server().listen(20180, function(error) {
  if (error) throw error;
  console.log('gps server is listening');
});

server.on('connect', function(tracker) { 
  tracker.on('disconnect', function() {
    console.log('tracker disconnected');
  })

  console.log('tracker connected!');
  tracker.disconnect();
});
```

#### requestReport
Request GPS report (internal: track on demand `0x4101`)

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.requestReport(function(err, data) {
  if (err) {
    console.log('REQUEST REPORT ERROR: ', err);
  } else {
    console.log('REQUEST REPORT: ', data);
  }
});
```

#### getSnImei
Request serial number & IMEI from tracker (internal: `0x9001`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.getSnImei(function(err, data) {
  if (err) {
    console.log('GET SN IMEI ERROR: ', err);
  } else {
    console.log('GET SN IMEI: ', data);
  }
});
```

#### resetConfiguration
Revert all settings (except for the password, IP, Port, APN, ID and GPRS interval) back to factory default (internal: `0x4110`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.resetConfiguration(function(err, result){
  if (err) {
    console.log('RESET CONFIGURATION ERROR: ', err);
  } else {
    console.log('RESET CONFIGURATION: ', result);
  }
});       
```

#### rebootGps
Reboot the GPS module of the tracker (internal: `0x4902`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.rebootGps(function(err, result){
  if (err) {
    console.log('REBOOT GPS ERROR: ', err);
  } else {
    console.log('REBOOT GPS: ', result);
  }
});
```

#### setExtendedSettings
Set extended tracker settings (internal: `0x4108`).

Parameter         | Type    | Default | Description
------------------|---------|---------|------------
setting.smsReplyOnCall    | boolean | true    | Send position report by sms after call is made to the tracker.
setting.useGPRMSFormat    | boolean | false   | Use NMEA 0183 GPRMC or normal text (for sms only).
setting.hangUpAfter5Rings | boolean | false   | Hang up after 5 rings.
setting.enableCallBuzzer  | boolean | false   | Turn on/off buzzer for the incoming call.
setting.enableLedLights   | boolean | true    | When is set to false, lights stop flashing when the tracker is working.
setting.alarmPowerOn      | boolean | true    | Send sms alarm to the authorized phone number for SOS, and a GPRS alarm to the server, when the tracker is turned on.
setting.alarmPowerCut     | boolean | false   | Send sms alarm to the authorized phone number for SOS when the power of the vehicle tracker is cut.
setting.alarmGpsBlindArea | boolean | false   | Send sms alarm when the tracker enters GPS blind area.
callback                  | function | -      | User callback

```js
tracker.setExtendedSettings({
  smsReplyOnCall    : true,
  useGPRMSFormat    : false, // works for sms only
  hangUpAfter5Rings : false,
  enableCallBuzzer  : false,
  enableLedLights   : true,
  alarmPowerOn      : true,
  alarmPowerCut     : false,
  alarmGpsBlindArea : false,
}, function(err, result){
  if (err) {
    console.log('SET EXTENDED SETTINGS ERROR: ', err);
  } else {
    console.log('SET EXTENDED SETTINGS: ', result);
  }
});
```

#### setHeartbeatInterval
Sets specified time interval for heartbeat message (internal: `0x5199`).

Parameter | Type     | Description
----------|----------|------------
interval  | integer  | Interval in minutes
callback  | function | User callback

```js
tracker.setHeartbeatInterval(1, function(err, result){
  if (err) {
    console.log('SET HEARTBEAT INTERVAL ERROR: ', err);
  } else {
    console.log('SET HEARTBEAT INTERVAL: ', result);
  }
});
```

#### clearMileage
Delete total mileage (internal: `0x4351`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.clearMileage(function(err, result){
  if (err) {
    console.log('CLEAR MILEAGE ERROR: ', err);
  } else {
    console.log('CLEAR MILEAGE: ', result);
  }
});
```

#### setPowerDownTimeout
Set inactivity timeout, after which tracker will go to energy saving mode (internal: `0x4126`).

Parameter | Type     | Description
----------|----------|------------
interval  | integer  | Interval in minutes, possible values: 0 - 99, 0 disables timeout.
callback  | function | User callback

```js
tracker.setPowerDownTimeout(15, function(err, result){
  if (err) {
    console.log('SET POWER DOWN TIMEOUT ERROR: ', err);
  } else {
    console.log('SET POWER DOWN TIMEOUT: ', result);
  }
}); 
```

#### getMemoryReports
Read logged data and returns reports array (high-level wrapper for internal command `0x9016`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.getMemoryReports(function(err, reports){
  if (err) {
    console.log('GET MEMORY REPORTS ERROR: ', err);
  } else {
    console.log('GET MEMORY REPORTS: ', reports);
  }
}); 
```

#### setMemoryReportInterval
Set interval for saving coordinates in memory, when internet is not available (internal: `0x4131`).

Parameter | Type     | Description
----------|----------|------------
interval  | integer  | Interval in seconds, possible values: 1 - 65535, 0 - disable.
callback  | function | User callback

```js
tracker.setMemoryReportInterval(1, function(err, result){
  if (err) {
    console.log('SET MEMORY REPORT INTERVAL ERROR: ', err);
  } else {
    console.log('SET MEMORY REPORT INTERVAL: ', result);
  }
});
```

#### clearMemoryReports
Clear reports stored in memory (internal: `0x5503`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.clearMemoryReports(function(err, result){
  if (err) {
    console.log('CLEAR MEMORY REPORTS ERROR: ', err);
  } else {
    console.log('CLEAR MEMORY REPORTS: ', result);
  }
});
```

#### getAuthorizedPhones
Return authorized phone numbers (internal: `0x9003`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.getAuthorizedPhones(function(err, phones){
  if (err) {
    console.log('GET AUTHORIZED PHONES ERROR: ', err);
  } else {
    console.log('GET AUTHORIZED PHONES: ', phones);
  }
});
```

#### setAuthorizedPhones
Set authorized phone for sos button, for receiving sms & calls (internal: `0x4103`).

Parameter | Type     | Description
----------|----------|------------
smsPhone  | string   | Authorized phone number for receiving sms.
callPhone | string   | Authorized phone number for receiving phone call.
callback  | function | User callback

```js
tracker.setAuthorizedPhones(79991234567, 79991234567, function(err, result){
  if (err) {
    console.log('SET AUTHORIZED PHONE ERROR: ', err);
  } else {
    console.log('SET AUTHORIZED PHONE: ', result);
  }
});
```

#### getReportTimeInterval
Retrieve reporting time interval from tracker, 1 unit = 10 seconds (internal: `0x9002`).

Parameter | Type     | Description
----------|----------|------------
callback  | function | User callback

```js
tracker.getReportTimeInterval(function(err, interval){
  if (err) {
    console.log('GET REPORT TIME INTERVAL ERROR: ', err);
  } else {
    console.log('GET REPORT TIME INTERVAL: ', interval);
  }
});
```

#### setReportTimeInterval
Set reporting time interval (internal: `0x4102`, `0x5100`).

Parameter | Type     | Description
----------|----------|------------
interval  | integer  | Reporting time interval, 1 unit = 10 seconds.
callback  | function | User callback

```js
tracker.setReportTimeInterval(2, function(err, result){
  if (err) {
    console.log('SET REPORT TIME INTERVAL ERROR: ', err);
  } else {
    console.log('SET REPORT TIME INTERVAL: ', result);
  }
});
```

#### setReportDistanceInterval
Set distance report as per pre-set interval. Sends out alarm when the car is moving and stops sending the report when the car is stationary (internal: `0x4303`).

Parameter | Type     | Description
----------|----------|------------
meters    | integer  | Distance interval, is suggested to be set above 300 meters.
callback  | function | User callback

```js
tracker.setReportDistanceInterval(300, function(err, result){
  if (err) {
    console.log('SET REPORT DISTANCE INTERVAL ERROR: ', err);
  } else {
    console.log('SET REPORT DISTANCE INTERVAL: ', result);
  }
});  
```

#### setAlarmSpeeding
Set speeding alarm (internal: `0x4105`).

Parameter | Type     | Description
----------|----------|------------
limit     | integer  | Speed limit, 1 unit = 10 kmph.
callback  | function | User callback

```js
tracker.setAlarmSpeeding(15, function(err, result){
  if (err) {
    console.log('SET ALARM SPEEDING ERROR: ', err);
  } else {
    console.log('SET ALARM SPEEDING: ', result);
  }
});
```

#### setAlarmMovement
Set movement alarm (internal: `0x4106`).

Parameter | Type    | Description
----------|---------|------------
area      | integer | For supported values please see [documentation](https://github.com/alvassin/nodejs-meiligao/blob/master/docs/protocol-specs.pdf)
callback  | function | User callback

```js
tracker.setAlarmMovement(0x03, function(err, result){
  if (err) {
    console.log('SET ALARM MOVEMENT ERROR: ', err);
  } else {
    console.log('SET ALARM MOVEMENT: ', result);
  }
});
```

#### setAlarmGeofence
Set geo-fence alarm (internal: `0x4302`).

Parameter | Type     | Description
----------|----------|------------
latitude  | number   | Center point latitude
longitude | number   | Center point longitude
radius    | integer  | Circle radius, possible values: 1 - 4294967295
callback  | function | User callback

```js
tracker.setAlarmGeofence(55.753905, 37.620872, 200, function(err, result){
  if (err) {
    console.log('SET ALARM GEOFENCE ERROR: ', err);
  } else {
    console.log('SET ALARM GEOFENCE: ', result);
  }
});
```

# Under the hood
Command names mapping, message types list & all other stuff related to message processing is located in [Message.js](https://github.com/alvassin/nodejs-meiligao/blob/master/lib/Message.js) file. 
[Original protocol documentation](https://github.com/alvassin/nodejs-meiligao/blob/master/docs/specs.pdf) is also included in case you will need deep understanding how Meiligao protocol works.
