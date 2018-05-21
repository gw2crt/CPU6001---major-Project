// Required Modules -

var noble = require('noble'); //noble bluetooth module

// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['19b10000e8f2537e4f6cd104768a1214'];

// Search only for the BLE charateristics UUID match v1_gen_101_acc!!!
var characteristicUuids = ['21d000512e7f4725b75f1c6deaa037e9', '19ffdafeab0e46f8983978b2b8129a65', '6d949dc6130e4aa7b044135bb9bd6b53', 'd7da537e341b4d4d85f6bc68458acc2c', 'b411fca49b034db091964427bcf16b8e', '9fdee997eaa64f9ebd4d3a477100353c'];

//var newDate = new Date();
//var timeStamp = newDate.toString();
//timeStamp = timeStamp.split(' ').slice(0,5).join(' '); //removes UTC info from time Stamp.

//console.log(timeString); // TimeStamp test.

// array to retrieve and store accelerometer data
var resultOut = {Date: 0, type:0, Occurance: 0, Time: 0, gForce: 0};
var accCollectedData = [ ];
var brakeCollectedData = [ ];

// auto start scanning when bluetooth is powered

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(serviceUuids);
    } else {
        noble.stopScanning();
    }
});

// ble discovery to allow connection between genuino 101 and RPI

noble.on('discover', function(peripheral) {
    peripheral.connect(function(error) {
        console.log('connected to peripheral: ' + peripheral.uuid); // console log to show device connected
        peripheral.discoverServices(serviceUuids, function(error, services) {
            var vehicleService = services[0];
            console.log('discovered Vehicle Data service');

            vehicleService.discoverCharacteristics(characteristicUuids, function(error, characteristics) {
                var vehicleDataCharacteristic = characteristics[0];
                //console.log('discovered accOccurrenceChar characteristic'); //Use for console display testing

                // Characteristic updates for Acceleration using the specific UUID pushing data into the acceleration array.

                vehicleDataCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readUInt8(0) + ' Acc Occurance Number');
                    resultOut["type"] = 'Acc';
                    resultOut["Occurance"] = data.readUInt8(0);
                });
                // to enable notify
                vehicleDataCharacteristic.subscribe(function(error) {
                    console.log('Ready');
                });

                var vehicleDataCharacteristic = characteristics[1];
                //console.log('discovered Acceleration Force characteristic'); //Use for console display testing

                vehicleDataCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readInt16LE() + ' MilliSeconds');
                    resultOut["Time"] = data.readInt16LE();
                });
                // to enable notify
                vehicleDataCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                var vehicleDataCharacteristic = characteristics[2];
                //console.log('discovered Acceleration Elapsed Time characteristic');

                vehicleDataCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readFloatLE().toFixed(2) + ' gForce');
                    resultOut["gForce"] = data.readFloatLE().toFixed(2);

                // collected data call back, pushed into acceleration array... Time stamp called and modified pushed into the array.


		    var newDate = new Date();
                    var timeStamp = newDate.toString();
                    timeStamp = timeStamp.split(' ').slice(0,5).join(' ');
                    resultOut["Date"] = timeStamp;

                    // array data is converted to JSON and function fired to send data via MQTT

                    //console.log(JSON.stringify(resultOut)); // console log testing
		            accCollectedData.push(JSON.stringify(resultOut));
                    sendAccMqtt();
                    //collectedData.push(resultOut);
                    //console.log(collectedData);

                });
                // to enable notify
                vehicleDataCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                // ----- Braking -----
                // identical to acceleration codebase

                var vehicleDataCharacteristic = characteristics[3];
                //console.log('discovered Brake Occurrence characteristic');

                vehicleDataCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readUInt8(0) + ' Brake Occurrence Number');
                    resultOut["type"] = 'Brake';
                    resultOut["Occurance"] = data.readUInt8(0);
                });
                // to enable notify
                vehicleDataCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                var vehicleDataCharacteristic = characteristics[4];
                //console.log('discovered Brake Force characteristic');

                vehicleDataCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readInt16LE() + ' Milliseconds');
                    resultOut["Time"] = data.readInt16LE();
                });
                // to enable notify
                vehicleDataCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                var vehicleDataCharacteristic = characteristics[5];
                //console.log('discovered Brake Elapsed Time characteristic');

                vehicleDataCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readFloatLE().toFixed(2) + ' gForce');
                    resultOut["gForce"] = data.readFloatLE().toFixed(2);

		    var newDate = new Date();
                    var timeStamp = newDate.toString();
                    timeStamp = timeStamp.split(' ').slice(0,5).join(' ');
                    resultOut["Date"] = timeStamp;

                    //console.log(JSON.stringify(resultOut));
                    brakeCollectedData.push(JSON.stringify(resultOut));
                    sendBrakeMqtt();
                    //console.log(collectedData.toString());
                });
                // to enable notify
                vehicleDataCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });
            });
        });
    });
});

// MQTT Functions - Sends data to Retail Sensing

function sendAccMqtt(){
    var mqtt = require('mqtt') // instansiation of the mqtt.js class
    var client  = mqtt.connect('mqtt://185.34.81.81') // connection to retail sensing

    colData = accCollectedData.toString() // array data is converted to string for sending to retail sensing

//call back function creating the connection, subscribing to the topic and publising accelerometer data using QOS2
    client.on('connect', function () {
        client.subscribe('VTLOG/VEHICLE/DATA')
        client.publish('VTLOG/VEHICLE/DATA', colData, {qos: 2})
    })

// callback to close the connection with the mqtt server / notification of message sent.
    client.on('message', function (topic, message) {
        // message is Buffer
        console.log('MQTT message:')
        console.log(message.toString())
        client.end()
    })

    //used to clear the array
    accCollectedData = [ ]
}

// Finction to send brake details, virtually identical to acceleration using the brake array. .

function sendBrakeMqtt(){
    var mqtt = require('mqtt')
    var client  = mqtt.connect('mqtt://185.34.81.81')

    colData = brakeCollectedData.toString()

    client.on('connect', function () {
        client.subscribe('VTLOG/VEHICLE/DATA')
        client.publish('VTLOG/VEHICLE/DATA', colData, {qos: 2})
    })

    client.on('message', function (topic, message) {
        // message is Buffer
        console.log('MQTT message:')
        console.log(message.toString())
        client.end()
    })

    //used to clear the array
    brakeCollectedData = [ ]
}
