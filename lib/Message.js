var crc = require('crc');

/**
 * Available commands
 */ 
Message.commands = {
    LOGIN                           : 0x5000, // sent by tracker
    CONFIRM_LOGIN                   : 0x4000,
    GET_SN_IMEI                     : 0x9001,
    REQUEST_REPORT                  : 0x4101,
    RESET_CONFIGURATION             : 0x4110,
    REBOOT_GPS                      : 0x4902,
    SET_EXTENDED_SETTINGS           : 0x4108,
    SET_HEARTBEAT_INTERVAL          : 0x5199,
    CLEAR_MILEAGE                   : 0x4351,
    SET_POWER_DOWN_TIMEOUT          : 0x4126,

    GET_MEMORY_REPORT               : 0x9016,
    SET_MEMORY_REPORT_INTERVAL      : 0x4131,
    CLEAR_MEMORY_REPORTS            : 0x5503,
    
    GET_AUTHORIZED_PHONE            : 0x9003,
    SET_AUTHORIZED_PHONE            : 0x4103,
    
    GET_REPORT_TIME_INTERVAL        : 0x9002,
    SET_REPORT_TIME_INTERVAL        : 0x4102,
    SET_REPORT_TIME_INTERVAL_RESULT : 0x5100,
    SET_REPORT_DISTANCE_INTERVAL    : 0x4303,

    SET_ALARM_SPEEDING              : 0x4105,
    SET_ALARM_MOVEMENT              : 0x4106,
    SET_ALARM_GEOFENCE              : 0x4302,
    
    REPORT                          : 0x9955, // sent by tracker
    ALARM                           : 0x9999, // sent by tracker
};

/** 
 * Message types
 */
Message.types = {
    REPORT_POWER_ON         : 0x14,
    REPORT_BY_TIME          : 0x9955,
    REPORT_BY_DISTANCE      : 0x63,
    REPORT_BLIND_AREA_START : 0x15,
    REPORT_BLIND_AREA_END   : 0x16,
    REPORT_DIRECTION_CHANGE : 0x52,
    
    ALARM_SOS_PRESSED       : 0x01,
    ALARM_SOS_RELEASED      : 0x31,
    ALARM_LOW_BATTERY       : 0x10,
    ALARM_SPEEDING          : 0x11,
    ALARM_MOVEMENT          : 0x12, // movement & geo-fence
};

/**
 * Message prefixes
 */
Message.PREFIX_CLIENT = '$$';
Message.PREFIX_SERVER = '@@';

/**
 * Available modes
 */
Message.MODE_NORMAL   = 0;
Message.MODE_RAW_DATA  = 1;
 
/**
 * Constructor
 * @param {object} options
 *  
 * Available options:
 * - trackerId
 * - command
 * - data
 * - prefix
 * - mode
 */
function Message(options) {
    
    /**
     * @var {string}
     */
    this.trackerId = '';
    
    /**
     * @var {number}
     */
    this.command = 0;
     
    /**
     * @var {mixed}
     */
    this.data = null;
    
    /**
     * @var {string}
     */
    this.prefix = '@@';
    
    /** 
     * @var {number}
     */
    this.mode = Message.MODE_NORMAL;
    
    // Fill in properties
    if (typeof options === 'object') {
        for (var key in options) {
            if (typeof this[key] !== 'undefined') {
                this[key] = options[key];
            }
        }
    }
}

/**
 * Creates message using buffer
 * @param {Buffer} buffer
 * @param {number} mode
 * @return {Message|boolean}
 */
Message.createFromBuffer = function(buffer, mode) {

    // Get hex representation
    var hex = buffer.toString('hex');
    
    // Validate checksum
    var checksum = hex.substring(hex.length - 8, hex.length - 4);
    var binary = new Buffer(hex.substring(0, hex.length - 8), 'hex').toString('binary');
    if (checksum !== crc.crc16ccitt(binary)) {
        return false;
    }
    
    // Detect message type
    var prefix = new Buffer(hex.substring(0, 4), 'hex').toString('ascii');
    if (prefix != Message.PREFIX_CLIENT && prefix != Message.PREFIX_SERVER) {
        return false;
    }
    
    // Parse data
    var data = hex.substring(26, hex.length - 8);
    if (mode !== Message.MODE_RAW_DATA) {
        data = new Buffer(data, 'hex').toString('ascii')
    }
    
    // Parse & return message
    return new Message({
        trackerId : parseInt(hex.substring(8, 22), 10).toString(10),
        command   : parseInt(hex.substring(22, 26), 16),
        data      : data,
        prefix    : prefix
    });
};

/**
 * Returns command name using specified code
 * @param {number} code
 * @return {string|boolean}
 */
Message.getCommandNameByCode = function(code) {
    for (var key in Message.commands) {
        if (Message.commands[key] === code) {
            return key;
        }
    }
    return false;
}

/**
 * Returns response command code for specified request command code
 * @param {number} code
 * @return {number}
 */
Message.resolveCommand = function(code) {
    switch (code) {
        case Message.commands.REQUEST_REPORT:
            return Message.commands.REPORT;
            
        case Message.commands.SET_REPORT_TIME_INTERVAL:
            return Message.commands.SET_REPORT_TIME_INTERVAL_RESULT;
            
        default:
            return code;
    }
}

/**
 * Returns message type by specified code
 * @param {number} code
 * @return {string|boolean}
 */
Message.getMessageTypeByCode = function(code) {
    for (var key in Message.types) {
        if (Message.types[key] === code) {
            return key;
        }
    }
    return false;
}

/**
 * Parses command data
 * @param {number} code
 * @param {mixed} buffer
 * @return {mixed}
 */
Message.parseCommandResult = function(code, buffer) {

    /**
     * Parses data (coordinates)
     * @param {string} ascii
     * @return {object}
     */
    function parseCoords(ascii) {
        
        // Prepare data
        var tmp = ascii.split('*');
        var part1 = tmp[0].split(',');
        var part2 = tmp[1].split('|');
        
        // Retrieve date & time                        
        var date = new Date(Date.UTC('20' + part1[8].substring(4,6), 
                        part1[8].substring(2, 4), 
                        part1[8].substring(0, 2), 
                        part1[0].substring(0, 2), 
                        part1[0].substring(2, 4), 
                        part1[0].substring(4, 6), 
                        part1[0].substring(7, 10)));
                        
        var latitude = parseInt(part1[2].substring(0,2), 10) + (parseFloat(part1[2].substring(2)) / 60);
        if (part1[3] === 'S') {
            latitude *= -1;
        }

        var longitude = parseInt(part1[4].substring(0,3), 10) + (parseFloat(part1[4].substring(3)) / 60);
        if (part1[5] === 'W') {
            longitude *= -1;
        }
        
        return {
            date           : date,
            latitude       : latitude,
            longitude      : longitude,
            speed          : parseFloat(part1[6]),
            heading        : parseFloat(part1[7]),
            altitude       : parseFloat(part2[2]),
            ioStatus       : part2[3],
            analogInput    : part2[4].split(','),
            baseStationId  : part2[5],
            csq            : parseFloat(part2[6]),
            journey        : parseInt(part2[7], 10),
            gpsValid       : part1[1] === 'A' ? true : false,
        };
    }
    
    // Use correct format for each command
    switch (code) {
        
        case Message.commands.GET_SN_IMEI:
            var data = buffer.toString('ascii').split(',');
            return {
                sn   : data[0],
                imei : data[1],
            };
        
        case Message.commands.GET_REPORT_TIME_INTERVAL:
            return parseInt(buffer.toString('hex'), 16);
        
        case Message.commands.GET_MEMORY_REPORT:
            // Is parsed at Tracker.getMemoryReports
            break;
            
        case Message.commands.GET_AUTHORIZED_PHONE:
            var hex = buffer.toString('hex');
            
            var phones = {
                sms  : hex.substring(0, 32),
                call : hex.substring(32, 64),
            }
            
            for (var i in phones) {
                while (phones[i].slice(-1) === '0') phones[i] = phones[i].substring(0, phones[i].length - 1);
                phones[i] = new Buffer(phones[i], 'hex').toString('ascii');
            }
            return phones;
        
        case Message.commands.RESET_CONFIGURATION:
        case Message.commands.REBOOT_GPS:
        case Message.commands.SET_EXTENDED_SETTINGS:
        case Message.commands.CLEAR_MEMORY_REPORTS:
        case Message.commands.CLEAR_MILEAGE:
        case Message.commands.SET_POWER_DOWN_TIMEOUT:
        case Message.commands.SET_HEARTBEAT_INTERVAL:
        case Message.commands.SET_AUTHORIZED_PHONE:
        case Message.commands.SET_MEMORY_REPORT_INTERVAL:
        case Message.commands.SET_ALARM_SPEEDING:
        case Message.commands.SET_ALARM_MOVEMENT:
        case Message.commands.SET_ALARM_GEOFENCE:
        case Message.commands.SET_REPORT_DISTANCE_INTERVAL:
            return !!parseInt(buffer.toString('hex'), 16);
        
        case Message.commands.SET_REPORT_TIME_INTERVAL_RESULT:
            return !!parseInt(buffer.toString('hex').substring(0, 2), 16);

        case Message.commands.REPORT:
            return parseCoords(buffer.toString('ascii'));
        
        case Message.commands.ALARM:
            return {
                type : parseInt(buffer.toString('hex').substring(0, 2), 16),
                data : parseCoords(new Buffer(buffer.toString('hex').substring(2), 'hex').toString('ascii')),
            };
    }
}

/**
 * Returns compact string representation,
 * useful for debugging
 * @return {string}
 */
Message.prototype.toString = function() {
    return (this.prefix === Message.PREFIX_SERVER ? 'server' : 'client') + ' '
         + '#' + this.trackerId + ' '
         + Message.getCommandNameByCode(this.command) + ' '
         + this.data;
};

/**
 * Returns encoded message as Buffer
 * If useRawData flag is true, data will be interpreted as hex
 * @return {Buffer}
 */
Message.prototype.toBuffer = function() {

    // Retrieve data hex
    var dataHex = this.data ? this.data : '';
    if (this.mode !== Message.MODE_RAW_DATA) {
        dataHex = new Buffer(dataHex).toString('hex');
    }
     
    // Calculate length & fill unused length bytes with leading zeroes 
    var length = 2  // Header
               + 2  // Length
               + 7  // Device id
               + 2  // Command
               + dataHex.length / 2
               + 2  // Checksum
               + 2; // Ending
    length = length.toString(16);     

    while (length.length < 4) {
        length = '0' + length;
    }
    
    // Get device id hex, usused bytes are stuffed by "f" or "0xff"
    var trackerIdHex = this.trackerId;
    while (trackerIdHex.length < 14) {
        trackerIdHex += 'f';
    }
    
    // Get command hex
    var commandHex = this.command.toString(16);
    while(commandHex.length < 4) {
        commandHex = '0' + commandHex;
    }
    
    // Build message
    var result = new Buffer(this.prefix).toString('hex')
               + length
               + trackerIdHex
               + commandHex
               + dataHex;
    
    // Add checksum & final bytes
    result +=crc.crc16ccitt(new Buffer(result, 'hex').toString('binary'))
           + new Buffer('\r\n').toString('hex');
    
    // Return buffer
    return new Buffer(result, 'hex');
};

module.exports = Message;